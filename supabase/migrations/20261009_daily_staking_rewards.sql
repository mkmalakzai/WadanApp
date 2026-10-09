-- WADAN staking reward settlement v1
-- Apply once in Supabase SQL Editor. Existing user balances are never reset.
-- Completes 24-hour staking days atomically and credits WDC once per completed day.

alter table public.stakes
  add column if not exists reward_paid_days integer not null default 0,
  add column if not exists daily_rate_at_start numeric(12,6);

-- Freeze the rate on existing positions at migration time.
update public.stakes s
set daily_rate_at_start = p.daily_rate
from public.staking_plans p
where s.plan_id = p.id
  and s.daily_rate_at_start is null;

create or replace function public.create_stake(
  p_user_id uuid,
  p_plan_id text,
  p_principal numeric
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
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
  if p_principal <= 0 then
    raise exception 'Principal must be positive';
  end if;

  perform public.apply_ledger_entry(
    p_user_id,'WDC','debit',p_principal,'stake_open','staking',null,
    jsonb_build_object('plan_id',p_plan_id,'daily_rate',v_plan.daily_rate)
  );

  insert into public.stakes (
    user_id,plan_id,principal,unlock_at,status,
    daily_rate_at_start,reward_paid_days
  )
  values (
    p_user_id,p_plan_id,p_principal,
    now()+make_interval(days=>v_plan.duration_days),'active',
    v_plan.daily_rate,0
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.settle_staking_rewards(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_position record;
  v_elapsed_days integer;
  v_unpaid_days integer;
  v_rate numeric(12,6);
  v_reward numeric(38,18);
  v_total numeric(38,18):=0;
  v_positions integer:=0;
begin
  if p_user_id is null then
    raise exception 'User required';
  end if;

  -- Serialize concurrent requests on each position. Repeated calls are idempotent.
  for v_position in
    select s.*, p.daily_rate, p.duration_days
    from public.stakes s
    join public.staking_plans p on p.id=s.plan_id
    where s.user_id=p_user_id and s.status='active'
    order by s.id
    for update of s
  loop
    v_elapsed_days:=least(
      v_position.duration_days,
      greatest(0,floor(extract(epoch from (now()-v_position.started_at))/86400)::integer)
    );
    v_unpaid_days:=greatest(0,v_elapsed_days-v_position.reward_paid_days);
    if v_unpaid_days>0 then
      v_rate:=coalesce(v_position.daily_rate_at_start,v_position.daily_rate);
      v_reward:=v_position.principal*(v_rate/100)*v_unpaid_days;

      update public.stakes
      set reward_paid_days=v_elapsed_days,
          accrued_reward=accrued_reward+v_reward
      where id=v_position.id;

      if v_reward>0 then
        perform public.apply_ledger_entry(
          p_user_id,'WDC','credit',v_reward,'stake_daily_reward',
          'staking',v_position.id,
          jsonb_build_object('completed_days',v_elapsed_days,'days_paid',v_unpaid_days,'daily_rate',v_rate)
        );
        v_total:=v_total+v_reward;
        v_positions:=v_positions+1;
      end if;
    end if;
  end loop;

  return jsonb_build_object('credited_wdc',v_total,'positions_updated',v_positions);
end;
$$;

-- Claim maturity pays original principal + *remaining* uncredited rewards,
-- preventing daily rewards being paid a second time on final settlement.
create or replace function public.claim_matured_stake(
  p_stake_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_stake public.stakes%rowtype;
  v_plan public.staking_plans%rowtype;
  v_rate numeric(12,6);
  v_total_reward numeric(38,18);
  v_remaining_reward numeric(38,18);
  v_final_credit numeric(38,18);
begin
  select * into v_stake
  from public.stakes
  where id=p_stake_id and user_id=p_user_id
  for update;

  if not found then raise exception 'Stake not found'; end if;
  if v_stake.status<>'active' then raise exception 'Stake is not active'; end if;
  if now()<v_stake.unlock_at then raise exception 'Stake is still locked'; end if;

  select * into v_plan from public.staking_plans where id=v_stake.plan_id;
  v_rate:=coalesce(v_stake.daily_rate_at_start,v_plan.daily_rate);
  v_total_reward:=v_stake.principal*(v_rate/100)*v_plan.duration_days;
  v_remaining_reward:=greatest(0,v_total_reward-v_stake.accrued_reward);
  v_final_credit:=v_stake.principal+v_remaining_reward;

  update public.stakes
  set status='unlocked',
      reward_paid_days=v_plan.duration_days,
      accrued_reward=v_total_reward
  where id=v_stake.id;

  perform public.apply_ledger_entry(
    p_user_id,'WDC','credit',v_final_credit,'stake_settlement','staking',v_stake.id,
    jsonb_build_object(
      'principal',v_stake.principal,
      'reward',v_remaining_reward,
      'reward_already_paid',v_stake.accrued_reward,
      'plan_id',v_stake.plan_id
    )
  );

  return jsonb_build_object(
    'stake_id',v_stake.id,
    'principal',v_stake.principal,
    'reward',v_remaining_reward,
    'total',v_final_credit
  );
end;
$$;

revoke all on function public.create_stake(uuid,text,numeric) from public;
revoke all on function public.settle_staking_rewards(uuid) from public;
revoke all on function public.claim_matured_stake(uuid,uuid) from public;

grant execute on function public.create_stake(uuid,text,numeric) to service_role;
grant execute on function public.settle_staking_rewards(uuid) to service_role;
grant execute on function public.claim_matured_stake(uuid,uuid) to service_role;
