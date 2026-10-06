-- WADAN core live backend migration
-- Run once in Supabase SQL Editor after the base schema.

create table if not exists public.swaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  from_asset text not null check (from_asset in ('WDC','USDT')),
  to_asset text not null check (to_asset in ('WDC','USDT')),
  from_amount numeric(38,18) not null check (from_amount > 0),
  to_amount numeric(38,18) not null check (to_amount > 0),
  price_usd numeric(38,18) not null check (price_usd > 0),
  status text not null default 'completed' check (status in ('completed','reversed')),
  created_at timestamptz not null default now(),
  constraint swaps_assets_different check (from_asset <> to_asset)
);

create index if not exists swaps_user_created_idx
  on public.swaps(user_id, created_at desc);

create table if not exists public.referral_codes (
  user_id uuid primary key references public.users(id) on delete cascade,
  code text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.users(id) on delete restrict,
  referred_user_id uuid unique not null references public.users(id) on delete restrict,
  status text not null default 'qualified' check (status in ('pending','qualified','blocked')),
  created_at timestamptz not null default now(),
  constraint referrals_no_self check (referrer_user_id <> referred_user_id)
);

create index if not exists referrals_referrer_idx
  on public.referrals(referrer_user_id, created_at desc);

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  beneficiary_user_id uuid not null references public.users(id) on delete restrict,
  source_user_id uuid references public.users(id) on delete restrict,
  level integer not null check (level between 1 and 5),
  asset text not null default 'WDC' check (asset in ('WDC','USDT')),
  amount numeric(38,18) not null default 0 check (amount >= 0),
  reason text,
  status text not null default 'recorded' check (status in ('recorded','credited','reversed')),
  created_at timestamptz not null default now()
);

create index if not exists referral_rewards_beneficiary_idx
  on public.referral_rewards(beneficiary_user_id, created_at desc);

insert into public.system_settings(key,value)
values
  ('deposit_address_bsc','""'::jsonb),
  ('withdraw_fee_wdc','0'::jsonb),
  ('withdraw_fee_usdt','0'::jsonb),
  ('swaps_enabled','false'::jsonb),
  ('referral_level_rates','[5,3,2,1,0.5]'::jsonb)
on conflict (key) do nothing;

create or replace function public.ensure_referral_code(
  p_user_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  select code into v_code
  from public.referral_codes
  where user_id = p_user_id;

  if v_code is not null then
    return v_code;
  end if;

  v_code := 'WDC-' || upper(substr(replace(p_user_id::text,'-',''),1,7));

  insert into public.referral_codes(user_id,code)
  values (p_user_id,v_code)
  on conflict (user_id) do update set code=excluded.code
  returning code into v_code;

  return v_code;
end;
$$;

create or replace function public.register_referral(
  p_referred_user_id uuid,
  p_code text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer uuid;
begin
  if p_code is null or btrim(p_code) = '' then
    return false;
  end if;

  select user_id into v_referrer
  from public.referral_codes
  where upper(code) = upper(btrim(p_code));

  if v_referrer is null or v_referrer = p_referred_user_id then
    return false;
  end if;

  insert into public.referrals(referrer_user_id,referred_user_id,status)
  values (v_referrer,p_referred_user_id,'qualified')
  on conflict (referred_user_id) do nothing;

  return found;
end;
$$;

create or replace function public.get_referral_overview(
  p_user_id uuid
)
returns jsonb
language sql
security definer
set search_path = public
as $$
with recursive network as (
  select
    r.referred_user_id as user_id,
    r.referrer_user_id,
    1 as level,
    r.status,
    r.created_at
  from public.referrals r
  where r.referrer_user_id = p_user_id

  union all

  select
    r.referred_user_id,
    r.referrer_user_id,
    n.level + 1,
    r.status,
    r.created_at
  from public.referrals r
  join network n on r.referrer_user_id = n.user_id
  where n.level < 5
),
rows as (
  select
    n.user_id,
    n.level,
    n.status,
    n.created_at,
    coalesce(u.display_name,'Member') as display_name
  from network n
  join public.users u on u.id = n.user_id
),
reward_total as (
  select coalesce(sum(amount),0) as total
  from public.referral_rewards
  where beneficiary_user_id = p_user_id and status='credited'
),
settings as (
  select coalesce(
    (select value from public.system_settings where key='referral_level_rates'),
    '[5,3,2,1,0.5]'::jsonb
  ) as rates
)
select jsonb_build_object(
  'code', public.ensure_referral_code(p_user_id),
  'total', (select count(*) from rows),
  'qualified', (select count(*) from rows where status='qualified'),
  'lifetime_rewards', (select total from reward_total),
  'rates', (select rates from settings),
  'members', coalesce(
    (select jsonb_agg(jsonb_build_object(
      'id', user_id,
      'name', display_name,
      'level', level,
      'status', status,
      'joined', created_at
    ) order by level, created_at desc) from rows),
    '[]'::jsonb
  )
);
$$;

create or replace function public.execute_swap(
  p_user_id uuid,
  p_from_asset text,
  p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price numeric(38,18);
  v_to_asset text;
  v_to_amount numeric(38,18);
  v_swap_id uuid;
  v_enabled boolean;
begin
  select coalesce((value #>> '{}')::boolean,false)
  into v_enabled
  from public.system_settings
  where key='swaps_enabled';

  if not coalesce(v_enabled,false) then
    raise exception 'Swaps are currently disabled';
  end if;

  if p_from_asset not in ('WDC','USDT') then
    raise exception 'Unsupported asset';
  end if;

  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  select (value #>> '{}')::numeric
  into v_price
  from public.system_settings
  where key='wdc_reference_price_usd';

  if v_price is null or v_price <= 0 then
    raise exception 'WDC reference price is unavailable';
  end if;

  if p_from_asset='USDT' then
    v_to_asset := 'WDC';
    v_to_amount := p_amount / v_price;
  else
    v_to_asset := 'USDT';
    v_to_amount := p_amount * v_price;
  end if;

  insert into public.swaps(user_id,from_asset,to_asset,from_amount,to_amount,price_usd,status)
  values (p_user_id,p_from_asset,v_to_asset,p_amount,v_to_amount,v_price,'completed')
  returning id into v_swap_id;

  perform public.apply_ledger_entry(
    p_user_id,p_from_asset,'debit',p_amount,'swap_debit','swap',v_swap_id,
    jsonb_build_object('to_asset',v_to_asset,'price_usd',v_price)
  );

  perform public.apply_ledger_entry(
    p_user_id,v_to_asset,'credit',v_to_amount,'swap_credit','swap',v_swap_id,
    jsonb_build_object('from_asset',p_from_asset,'price_usd',v_price)
  );

  return jsonb_build_object(
    'id',v_swap_id,
    'from_asset',p_from_asset,
    'to_asset',v_to_asset,
    'from_amount',p_amount,
    'to_amount',v_to_amount,
    'price_usd',v_price
  );
end;
$$;

create or replace function public.reject_deposit(
  p_deposit_id uuid,
  p_admin_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deposit public.deposits%rowtype;
begin
  select * into v_deposit
  from public.deposits
  where id=p_deposit_id
  for update;

  if not found then
    raise exception 'Deposit not found';
  end if;

  if v_deposit.status='confirmed' then
    raise exception 'Confirmed deposit cannot be rejected';
  end if;

  update public.deposits
  set status='rejected', confirmed_at=now(), confirmed_by=p_admin_id
  where id=p_deposit_id;

  insert into public.admin_audit_logs(admin_id,action,entity_type,entity_id,metadata)
  values (p_admin_id,'reject_deposit','deposit',p_deposit_id::text,
    jsonb_build_object('amount',v_deposit.amount,'asset',v_deposit.asset,'tx_hash',v_deposit.tx_hash));
end;
$$;

create or replace function public.mark_withdrawal_sent(
  p_withdrawal_id uuid,
  p_admin_id text,
  p_tx_hash text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_withdrawal public.withdrawals%rowtype;
begin
  select * into v_withdrawal
  from public.withdrawals
  where id=p_withdrawal_id
  for update;

  if not found then
    raise exception 'Withdrawal not found';
  end if;

  if v_withdrawal.status <> 'approved' then
    raise exception 'Withdrawal must be approved first';
  end if;

  if p_tx_hash is null or btrim(p_tx_hash)='' then
    raise exception 'Transaction hash required';
  end if;

  update public.withdrawals
  set status='sent', tx_hash=btrim(p_tx_hash), reviewed_at=now(), reviewed_by=p_admin_id
  where id=p_withdrawal_id;

  insert into public.admin_audit_logs(admin_id,action,entity_type,entity_id,metadata)
  values (p_admin_id,'mark_withdrawal_sent','withdrawal',p_withdrawal_id::text,
    jsonb_build_object('tx_hash',btrim(p_tx_hash),'amount',v_withdrawal.amount,'asset',v_withdrawal.asset));
end;
$$;

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
  v_plan public.staking_plans%rowtype;
  v_reward numeric(38,18);
  v_total numeric(38,18);
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

  select * into v_plan
  from public.staking_plans
  where id=v_stake.plan_id;

  v_reward := v_stake.principal * (v_plan.daily_rate / 100) * v_plan.duration_days;
  v_total := v_stake.principal + v_reward;

  update public.stakes
  set status='unlocked', accrued_reward=v_reward
  where id=v_stake.id;

  perform public.apply_ledger_entry(
    p_user_id,'WDC','credit',v_total,'stake_settlement','staking',v_stake.id,
    jsonb_build_object('principal',v_stake.principal,'reward',v_reward,'plan_id',v_stake.plan_id)
  );

  return jsonb_build_object('stake_id',v_stake.id,'principal',v_stake.principal,'reward',v_reward,'total',v_total);
end;
$$;

create or replace function public.admin_set_setting(
  p_key text,
  p_value jsonb,
  p_admin_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.system_settings(key,value,updated_at,updated_by)
  values (p_key,p_value,now(),p_admin_id)
  on conflict (key) do update
    set value=excluded.value, updated_at=now(), updated_by=p_admin_id;

  insert into public.admin_audit_logs(admin_id,action,entity_type,entity_id,metadata)
  values (p_admin_id,'set_setting','system_setting',p_key,jsonb_build_object('value',p_value));
end;
$$;

alter table public.swaps enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;

revoke all on function public.ensure_referral_code(uuid) from public;
revoke all on function public.register_referral(uuid,text) from public;
revoke all on function public.get_referral_overview(uuid) from public;
revoke all on function public.execute_swap(uuid,text,numeric) from public;
revoke all on function public.reject_deposit(uuid,text) from public;
revoke all on function public.mark_withdrawal_sent(uuid,text,text) from public;
revoke all on function public.claim_matured_stake(uuid,uuid) from public;
revoke all on function public.admin_set_setting(text,jsonb,text) from public;

grant execute on function public.ensure_referral_code(uuid) to service_role;
grant execute on function public.register_referral(uuid,text) to service_role;
grant execute on function public.get_referral_overview(uuid) to service_role;
grant execute on function public.execute_swap(uuid,text,numeric) to service_role;
grant execute on function public.reject_deposit(uuid,text) to service_role;
grant execute on function public.mark_withdrawal_sent(uuid,text,text) to service_role;
grant execute on function public.claim_matured_stake(uuid,uuid) to service_role;
grant execute on function public.admin_set_setting(text,jsonb,text) to service_role;
