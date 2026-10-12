-- WADAN: Daily staking rewards as SPENDABLE WDC.
-- Apply ONCE in Supabase SQL Editor before depending on daily credit.
-- Matured days (24-hour intervals from stake start) are credited atomically.
-- This migration preserves existing stakes and does not modify their principal.

alter table public.stakes
  add column if not exists reward_paid_days integer not null default 0,
  add column if not exists reward_rate_daily numeric(12,6),
  add column if not exists reward_duration_days integer;

-- Lock in the original terms for existing stakes using their current plan.
-- New stakes snapshot the plan terms on creation.
update public.stakes as s
set reward_rate_daily = coalesce(s.reward_rate_daily,p.daily_rate),
    reward_duration_days = coalesce(s.reward_duration_days,p.duration_days)
from public.staking_plans as p
where s.plan_id = p.id
  and (s.reward_rate_daily is null or s.reward_duration_days is null);

alter table public.stakes
  alter column reward_rate_daily set not null,
  alter column reward_duration_days set not null;

-- Past unlocked stakes have already been settled by the old claim routine.
-- Mark their full reward as paid, preventing historical double payment.
update public.stakes
set reward_paid_days = reward_duration_days
where status='unlocked'
  and reward_paid_days < reward_duration_days;

create or replace function public.accrue_staking_rewards(
  p_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stake public.stakes%rowtype;
  v_now timestamptz := clock_timestamp();
  v_due_days integer;
  v_new_days integer;
  v_reward numeric(38,18);
  v_total numeric(38,18) := 0;
  v_positions integer := 0;
begin
  -- Row locks serialize concurrent cron, wallet and swap requests.
  -- Updates, ledger entries and wallet credits commit together.
  for v_stake in
    select *
    from public.stakes
    where status = 'active'
      and (p_user_id is null or user_id = p_user_id)
    order by started_at, id
    for update
  loop
    v_due_days := least(
      v_stake.reward_duration_days,
      greatest(0,
        floor(
          extract(epoch from
            (least(v_now, v_stake.unlock_at) - v_stake.started_at)
          ) / 86400
        )::integer
      )
    );

    if v_due_days <= v_stake.reward_paid_days then
      continue;
    end if;

    v_new_days := v_due_days - v_stake.reward_paid_days;
    v_reward := round(
      v_stake.principal * v_stake.reward_rate_daily / 100 * v_new_days,
      18
    );

    update public.stakes
    set reward_paid_days = v_due_days,
        accrued_reward = accrued_reward + v_reward
    where id = v_stake.id;

    if v_reward > 0 then
      perform public.apply_ledger_entry(
        v_stake.user_id,
        'WDC',
        'credit',
        v_reward,
        'stake_daily_reward',
        'staking',
        v_stake.id,
        jsonb_build_object(
          'plan_id', v_stake.plan_id,
          'from_completed_day', v_stake.reward_paid_days + 1,
          'to_completed_day', v_due_days,
          'days_paid', v_new_days,
          'daily_rate_percent', v_stake.reward_rate_daily
        )
      );
    end if;

    v_total := v_total + v_reward;
    v_positions := v_positions + 1;
  end loop;

  return jsonb_build_object(
    'credited_wdc', v_total,
    'positions_updated', v_positions
  );
end;
$$;

-- Fixed terms for newly created stakes, even if an admin edits plans later.
create or replace function public.create_stake(
  p_user_id uuid,
  p_plan_id text,
  p_principal numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan public.staking_plans%rowtype;
  v_id uuid;
begin
  select * into v_plan
  from public.staking_plans
  where id = p_plan_id
  for update;

  if not found or not v_plan.enabled then
    raise exception 'Staking plan is unavailable';
  end if;
  if p_principal <= 0 then
    raise exception 'Principal must be positive';
  end if;

  perform public.apply_ledger_entry(
    p_user_id,'WDC','debit',p_principal,'stake_open','staking',null,
    jsonb_build_object('plan_id',p_plan_id)
  );

  insert into public.stakes(
    user_id, plan_id, principal, unlock_at, status,
    reward_rate_daily, reward_duration_days, reward_paid_days
  )
  values (
    p_user_id,p_plan_id,p_principal,
    now() + make_interval(days => v_plan.duration_days),'active',
    v_plan.daily_rate,v_plan.duration_days,0
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- Claim ONLY principal and any uncredited remainder at maturity.
-- Previously credited daily profit must never be credited a second time.
create or replace function public.claim_matured_stake(
  p_stake_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stake public.stakes%rowtype;
  v_full_reward numeric(38,18);
  v_unpaid numeric(38,18);
begin
  perform public.accrue_staking_rewards(p_user_id);

  select * into v_stake
  from public.stakes
  where id = p_stake_id and user_id = p_user_id
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

  v_full_reward := round(
    v_stake.principal * v_stake.reward_rate_daily / 100 * v_stake.reward_duration_days,
    18
  );
  v_unpaid := greatest(0, v_full_reward - v_stake.accrued_reward);

  update public.stakes
  set status = 'unlocked',
      reward_paid_days = reward_duration_days,
      accrued_reward = accrued_reward + v_unpaid
  where id = v_stake.id;

  if v_unpaid > 0 then
    perform public.apply_ledger_entry(
      p_user_id,'WDC','credit',v_unpaid,'stake_final_reward','staking',v_stake.id,
      jsonb_build_object('plan_id',v_stake.plan_id,'previously_paid',v_stake.accrued_reward)
    );
  end if;

  perform public.apply_ledger_entry(
    p_user_id,'WDC','credit',v_stake.principal,
    'stake_principal_return','staking',v_stake.id,
    jsonb_build_object(
      'plan_id',v_stake.plan_id,
      'reward_previously_paid',v_stake.accrued_reward,
      'final_reward',v_unpaid
    )
  );

  return jsonb_build_object(
    'stake_id',v_stake.id,
    'principal',v_stake.principal,
    'reward_total',v_full_reward,
    'reward_paid_earlier',v_stake.accrued_reward,
    'reward_paid_now',v_unpaid
  );
end;
$$;

revoke all on function public.accrue_staking_rewards(uuid) from public, anon, authenticated;
grant execute on function public.accrue_staking_rewards(uuid) to service_role;

revoke all on function public.create_stake(uuid,text,numeric) from public, anon, authenticated;
grant execute on function public.create_stake(uuid,text,numeric) to service_role;

revoke all on function public.claim_matured_stake(uuid,uuid) from public, anon, authenticated;
grant execute on function public.claim_matured_stake(uuid,uuid) to service_role;

-- Pay every already-completed day for existing ACTIVE positions immediately.
select public.accrue_staking_rewards(null::uuid) as initial_staking_credit;
