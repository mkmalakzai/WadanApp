-- WADAN backend foundation
-- PostgreSQL / Supabase
-- Run this in a private Supabase project before connecting production environment variables.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  external_user_id text unique not null,
  display_name text,
  email text,
  phone text,
  country text,
  status text not null default 'active' check (status in ('active','frozen','banned')),
  kyc_status text not null default 'not_started' check (kyc_status in ('not_started','pending','verified','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallets (
  user_id uuid not null references public.users(id) on delete cascade,
  asset text not null check (asset in ('WDC','USDT')),
  balance numeric(38,18) not null default 0 check (balance >= 0),
  locked_balance numeric(38,18) not null default 0 check (locked_balance >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, asset)
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  asset text not null check (asset in ('WDC','USDT')),
  direction text not null check (direction in ('credit','debit')),
  amount numeric(38,18) not null check (amount > 0),
  entry_type text not null,
  reference_type text,
  reference_id uuid,
  balance_after numeric(38,18) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ledger_user_created_idx
  on public.ledger_entries(user_id, created_at desc);

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  asset text not null check (asset in ('WDC','USDT')),
  network text not null default 'BSC',
  amount numeric(38,18) not null check (amount > 0),
  tx_hash text,
  status text not null default 'pending' check (status in ('pending','detected','confirmed','rejected')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by text
);

create unique index if not exists deposits_tx_hash_unique
  on public.deposits(tx_hash)
  where tx_hash is not null;

create index if not exists deposits_status_created_idx
  on public.deposits(status, created_at desc);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  asset text not null check (asset in ('WDC','USDT')),
  network text not null default 'BSC',
  amount numeric(38,18) not null check (amount > 0),
  fee numeric(38,18) not null default 0 check (fee >= 0),
  address text not null,
  tx_hash text,
  status text not null default 'pending' check (status in ('pending','approved','sent','rejected','cancelled')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

create index if not exists withdrawals_status_created_idx
  on public.withdrawals(status, created_at desc);

create table if not exists public.staking_plans (
  id text primary key,
  title text not null,
  duration_days integer not null check (duration_days > 0),
  daily_rate numeric(12,6) not null check (daily_rate >= 0),
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.staking_plans (id,title,duration_days,daily_rate,enabled)
values
  ('6m','6 Month Plan',180,0.600000,false),
  ('12m','12 Month Plan',365,0.700000,false)
on conflict (id) do nothing;

create table if not exists public.stakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  plan_id text not null references public.staking_plans(id),
  principal numeric(38,18) not null check (principal > 0),
  accrued_reward numeric(38,18) not null default 0 check (accrued_reward >= 0),
  started_at timestamptz not null default now(),
  unlock_at timestamptz not null,
  status text not null default 'active' check (status in ('active','unlocked','cancelled'))
);

create index if not exists stakes_user_status_idx
  on public.stakes(user_id, status);

create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

insert into public.system_settings (key,value)
values
  ('wdc_reference_price_usd','0.01'::jsonb),
  ('withdrawals_enabled','false'::jsonb),
  ('deposits_enabled','false'::jsonb),
  ('staking_enabled','false'::jsonb)
on conflict (key) do nothing;

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id text not null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_created_idx
  on public.admin_audit_logs(created_at desc);

create or replace function public.apply_ledger_entry(
  p_user_id uuid,
  p_asset text,
  p_direction text,
  p_amount numeric,
  p_entry_type text,
  p_reference_type text default null,
  p_reference_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric(38,18);
  v_new_balance numeric(38,18);
begin
  if p_asset not in ('WDC','USDT') then
    raise exception 'Unsupported asset';
  end if;

  if p_direction not in ('credit','debit') then
    raise exception 'Unsupported direction';
  end if;

  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  insert into public.wallets(user_id,asset)
  values (p_user_id,p_asset)
  on conflict (user_id,asset) do nothing;

  select balance
  into v_balance
  from public.wallets
  where user_id = p_user_id and asset = p_asset
  for update;

  v_new_balance :=
    case when p_direction = 'credit'
      then v_balance + p_amount
      else v_balance - p_amount
    end;

  if v_new_balance < 0 then
    raise exception 'Insufficient balance';
  end if;

  update public.wallets
  set balance = v_new_balance, updated_at = now()
  where user_id = p_user_id and asset = p_asset;

  insert into public.ledger_entries(
    user_id,asset,direction,amount,entry_type,
    reference_type,reference_id,balance_after,metadata
  )
  values (
    p_user_id,p_asset,p_direction,p_amount,p_entry_type,
    p_reference_type,p_reference_id,v_new_balance,p_metadata
  );

  return v_new_balance;
end;
$$;

create or replace function public.confirm_deposit(
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
  select *
  into v_deposit
  from public.deposits
  where id = p_deposit_id
  for update;

  if not found then
    raise exception 'Deposit not found';
  end if;

  if v_deposit.status = 'confirmed' then
    return;
  end if;

  if v_deposit.status not in ('pending','detected') then
    raise exception 'Deposit cannot be confirmed from status %', v_deposit.status;
  end if;

  perform public.apply_ledger_entry(
    v_deposit.user_id,
    v_deposit.asset,
    'credit',
    v_deposit.amount,
    'deposit',
    'deposit',
    v_deposit.id,
    jsonb_build_object('tx_hash',v_deposit.tx_hash,'network',v_deposit.network)
  );

  update public.deposits
  set status='confirmed', confirmed_at=now(), confirmed_by=p_admin_id
  where id=p_deposit_id;

  insert into public.admin_audit_logs(admin_id,action,entity_type,entity_id,metadata)
  values (p_admin_id,'confirm_deposit','deposit',p_deposit_id::text,jsonb_build_object('amount',v_deposit.amount,'asset',v_deposit.asset));
end;
$$;

create or replace function public.request_withdrawal(
  p_user_id uuid,
  p_asset text,
  p_amount numeric,
  p_fee numeric,
  p_address text,
  p_network text default 'BSC'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total numeric(38,18);
  v_id uuid;
  v_balance numeric(38,18);
begin
  if p_amount <= 0 or p_fee < 0 then
    raise exception 'Invalid withdrawal amount';
  end if;

  v_total := p_amount + p_fee;

  insert into public.wallets(user_id,asset)
  values (p_user_id,p_asset)
  on conflict (user_id,asset) do nothing;

  select balance
  into v_balance
  from public.wallets
  where user_id=p_user_id and asset=p_asset
  for update;

  if v_balance < v_total then
    raise exception 'Insufficient balance';
  end if;

  insert into public.withdrawals(user_id,asset,network,amount,fee,address,status)
  values (p_user_id,p_asset,p_network,p_amount,p_fee,p_address,'pending')
  returning id into v_id;

  update public.wallets
  set balance=balance-v_total,
      locked_balance=locked_balance+v_total,
      updated_at=now()
  where user_id=p_user_id and asset=p_asset;

  insert into public.ledger_entries(
    user_id,asset,direction,amount,entry_type,reference_type,reference_id,balance_after
  )
  select p_user_id,p_asset,'debit',v_total,'withdrawal_hold','withdrawal',v_id,balance
  from public.wallets
  where user_id=p_user_id and asset=p_asset;

  return v_id;
end;
$$;

create or replace function public.approve_withdrawal(
  p_withdrawal_id uuid,
  p_admin_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_withdrawal public.withdrawals%rowtype;
  v_total numeric(38,18);
begin
  select *
  into v_withdrawal
  from public.withdrawals
  where id=p_withdrawal_id
  for update;

  if not found then
    raise exception 'Withdrawal not found';
  end if;

  if v_withdrawal.status <> 'pending' then
    raise exception 'Withdrawal is not pending';
  end if;

  v_total := v_withdrawal.amount + v_withdrawal.fee;

  update public.wallets
  set locked_balance=locked_balance-v_total, updated_at=now()
  where user_id=v_withdrawal.user_id and asset=v_withdrawal.asset;

  update public.withdrawals
  set status='approved', reviewed_at=now(), reviewed_by=p_admin_id
  where id=p_withdrawal_id;

  insert into public.admin_audit_logs(admin_id,action,entity_type,entity_id,metadata)
  values (p_admin_id,'approve_withdrawal','withdrawal',p_withdrawal_id::text,jsonb_build_object('amount',v_withdrawal.amount,'fee',v_withdrawal.fee,'asset',v_withdrawal.asset));
end;
$$;

create or replace function public.reject_withdrawal(
  p_withdrawal_id uuid,
  p_admin_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_withdrawal public.withdrawals%rowtype;
  v_total numeric(38,18);
begin
  select *
  into v_withdrawal
  from public.withdrawals
  where id=p_withdrawal_id
  for update;

  if not found then
    raise exception 'Withdrawal not found';
  end if;

  if v_withdrawal.status <> 'pending' then
    raise exception 'Withdrawal is not pending';
  end if;

  v_total := v_withdrawal.amount + v_withdrawal.fee;

  update public.wallets
  set locked_balance=locked_balance-v_total,
      balance=balance+v_total,
      updated_at=now()
  where user_id=v_withdrawal.user_id and asset=v_withdrawal.asset;

  insert into public.ledger_entries(
    user_id,asset,direction,amount,entry_type,reference_type,reference_id,balance_after
  )
  select v_withdrawal.user_id,v_withdrawal.asset,'credit',v_total,'withdrawal_reversal','withdrawal',v_withdrawal.id,balance
  from public.wallets
  where user_id=v_withdrawal.user_id and asset=v_withdrawal.asset;

  update public.withdrawals
  set status='rejected', reviewed_at=now(), reviewed_by=p_admin_id
  where id=p_withdrawal_id;

  insert into public.admin_audit_logs(admin_id,action,entity_type,entity_id,metadata)
  values (p_admin_id,'reject_withdrawal','withdrawal',p_withdrawal_id::text,jsonb_build_object('amount',v_withdrawal.amount,'fee',v_withdrawal.fee,'asset',v_withdrawal.asset));
end;
$$;

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
  select *
  into v_plan
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
    jsonb_build_object('plan_id',p_plan_id)
  );

  insert into public.stakes(user_id,plan_id,principal,unlock_at,status)
  values (p_user_id,p_plan_id,p_principal,now() + make_interval(days=>v_plan.duration_days),'active')
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.admin_overview()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'users', (select count(*) from public.users),
    'pending_deposits', (select count(*) from public.deposits where status in ('pending','detected')),
    'pending_withdrawals', (select count(*) from public.withdrawals where status='pending'),
    'active_stakes', (select count(*) from public.stakes where status='active'),
    'total_wdc', (select coalesce(sum(balance + locked_balance),0) from public.wallets where asset='WDC'),
    'total_usdt', (select coalesce(sum(balance + locked_balance),0) from public.wallets where asset='USDT'),
    'active_staked_wdc', (select coalesce(sum(principal),0) from public.stakes where status='active')
  );
$$;

alter table public.users enable row level security;
alter table public.wallets enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.deposits enable row level security;
alter table public.withdrawals enable row level security;
alter table public.staking_plans enable row level security;
alter table public.stakes enable row level security;
alter table public.system_settings enable row level security;
alter table public.admin_audit_logs enable row level security;

revoke all on function public.apply_ledger_entry(uuid,text,text,numeric,text,text,uuid,jsonb) from public;
revoke all on function public.confirm_deposit(uuid,text) from public;
revoke all on function public.request_withdrawal(uuid,text,numeric,numeric,text,text) from public;
revoke all on function public.approve_withdrawal(uuid,text) from public;
revoke all on function public.reject_withdrawal(uuid,text) from public;
revoke all on function public.create_stake(uuid,text,numeric) from public;
revoke all on function public.admin_overview() from public;

grant execute on function public.apply_ledger_entry(uuid,text,text,numeric,text,text,uuid,jsonb) to service_role;
grant execute on function public.confirm_deposit(uuid,text) to service_role;
grant execute on function public.request_withdrawal(uuid,text,numeric,numeric,text,text) to service_role;
grant execute on function public.approve_withdrawal(uuid,text) to service_role;
grant execute on function public.reject_withdrawal(uuid,text) to service_role;
grant execute on function public.create_stake(uuid,text,numeric) to service_role;
grant execute on function public.admin_overview() to service_role;
