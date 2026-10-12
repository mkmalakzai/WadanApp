-- WADAN: idempotent completed-day staking credits.
-- IMPORTANT: Review this migration and test with a test account before enabling
-- financial payouts. It does not transfer tokens on BNB Chain.
-- Running this SQL is a separate, explicit action in Supabase SQL Editor.

begin;

alter table public.stakes
  add column if not exists daily_rate_at_start numeric(12,6);

alter table public.stakes
  add column if not exists reward_paid_days integer not null default 0;

update public.stakes s
set daily_rate_at_start = p.daily_rate
from public.staking_plans p
where s.plan_id = p.id
  and s.daily_rate_at_start is null;

-- Do not silently count already-recorded rewards as unpaid.
do $audit$
begin
  if exists(
    select 1 from public.stakes
    where status='active'
      and accrued_reward > 0
      and reward_paid_days = 0
  ) then
    raise exception 'Existing active staking rewards need review before enabling daily settlement';
  end if;
end;
$audit$;

alter table public.stakes
  alter column daily_rate_at_start set not null;

create or replace function public.create_stake(
  p_user_id uuid,
  p_plan_id text,
  p_principal numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_plan public.staking_plans%rowtype;
  v_id uuid;
begin
  select * into v_plan
  from public.staking_plans
  where id=p_plan_id
  for update;

  if not found or not v_plan.enabled then
    raise exception 'Staking plan is unavailable';
  end if;

  if p_principal is null or p_principal <= 0 then
    raise exception 'Principal must be positive';
  end if;

  perform public.apply_ledger_entry(
    p_user_id,'WDC','debit',p_principal,'stake_open','staking',null,
    jsonb_build_object('plan_id',p_plan_id,'daily_rate',v_plan.daily_rate)
  );

  insert into public.stakes(
    user_id,plan_id,principal,started_at,unlock_at,status,
    daily_rate_at_start,reward_paid_days,accrued_reward
  )
  values (
    p_user_id,p_plan_id,p_principal,now(),
    now()+make_interval(days=>v_plan.duration_days),'active',
    v_plan.daily_rate,0,0
  )
  returning id into v_id;

  return v_id;
end;
$function$;

create or replace function public.settle_wallet_rewards(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_stake public.stakes%rowtype;
  v_plan public.staking_plans%rowtype;
  v_days_completed integer;
  v_new_days integer;
  v_reward numeric(38,18);
  v_total numeric(38,18) := 0;
  v_count integer := 0;
begin
  if p_user_id is null then
    raise exception 'User is required';
  end if;

  -- Lock each active position. Concurrent runs serialize and credit each
  -- completed 24-hour day at most once, in the same DB transaction as ledger.
  for v_stake in
    select * from public.stakes
    where user_id=p_user_id and status='active'
    order by id
    for update
  loop
    select * into v_plan from public.staking_plans
    where id=v_stake.plan_id;

    if not found then
      raise exception 'Staking plan % not found',v_stake.plan_id;
    end if;

    v_days_completed := least(
      v_plan.duration_days,
      greatest(0,floor(extract(epoch from (now()-v_stake.started_at))/86400)::integer)
    );
    v_new_days := v_days_completed - v_stake.reward_paid_days;

    if v_new_days > 0 then
      v_reward := round(
        v_stake.principal * (v_stake.daily_rate_at_start / 100) * v_new_days,
        18
      );

      update public.stakes
      set reward_paid_days=v_days_completed,
          accrued_reward=accrued_reward+v_reward
      where id=v_stake.id;

      if v_reward > 0 then
        perform public.apply_ledger_entry(
          p_user_id,'WDC','credit',v_reward,'staking_daily_reward','staking',v_stake.id,
          jsonb_build_object('completed_days',v_days_completed,'new_days',v_new_days,'daily_rate',v_stake.daily_rate_at_start)
        );
        v_total := v_total + v_reward;
        v_count := v_count + 1;
      end if;
    end if;
  end loop;

  return jsonb_build_object('credited_wdc',v_total,'settled_positions',v_count);
end;
$function$;

-- Maturity returns principal plus only the rewards not already credited.
-- Without this replacement, claim_matured_stake would pay rewards twice.
create or replace function public.claim_matured_stake(
  p_stake_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_stake public.stakes%rowtype;
  v_plan public.staking_plans%rowtype;
  v_total_reward numeric(38,18);
  v_remaining_reward numeric(38,18);
  v_total_credit numeric(38,18);
begin
  select * into v_stake
  from public.stakes
  where id=p_stake_id and user_id=p_user_id
  for update;

  if not found then
    raise exception 'Stake not found';
  end if;
  if v_stake.status <> 'active' then
    raise exception 'Stake is not active';
  end if;
  if now() < v_stake.unlock_at then
    raise exception 'Stake is still locked';
  end if;

  select * into v_plan from public.staking_plans
  where id=v_stake.plan_id;
  if not found then
    raise exception 'Staking plan not found';
  end if;

  v_total_reward := round(
    v_stake.principal*(v_stake.daily_rate_at_start/100)*v_plan.duration_days,
    18
  );
  v_remaining_reward := greatest(0,v_total_reward-v_stake.accrued_reward);
  v_total_credit := v_stake.principal+v_remaining_reward;

  update public.stakes
  set status='unlocked',
      reward_paid_days=v_plan.duration_days,
      accrued_reward=v_total_reward
  where id=v_stake.id;

  perform public.apply_ledger_entry(
    p_user_id,'WDC','credit',v_total_credit,'stake_settlement','staking',v_stake.id,
    jsonb_build_object(
      'principal',v_stake.principal,
      'remaining_reward',v_remaining_reward,
      'already_credited_reward',v_stake.accrued_reward,
      'plan_id',v_stake.plan_id
    )
  );

  return jsonb_build_object(
    'stake_id',v_stake.id,
    'principal',v_stake.principal,
    'reward',v_remaining_reward,
    'already_credited_reward',v_stake.accrued_reward,
    'total',v_total_credit
  );
end;
$function$;

revoke all on function public.settle_wallet_rewards(uuid) from public;
revoke all on function public.settle_wallet_rewards(uuid) from anon, authenticated;
grant execute on function public.settle_wallet_rewards(uuid) to service_role;

revoke all on function public.claim_matured_stake(uuid,uuid) from public;
revoke all on function public.claim_matured_stake(uuid,uuid) from anon, authenticated;
grant execute on function public.claim_matured_stake(uuid,uuid) to service_role;

revoke all on function public.create_stake(uuid,text,numeric) from public;
revoke all on function public.create_stake(uuid,text,numeric) from anon, authenticated;
grant execute on function public.create_stake(uuid,text,numeric) to service_role;

-- Feature gate: OFF after migration. Enable only after manual review/testing.
insert into public.system_settings(key,value)
values ('staking_rewards_settlement_enabled','false'::jsonb)
on conflict (key) do nothing;

commit;
