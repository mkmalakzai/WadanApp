import {
  BackendNotConfiguredError,
  getBackendConfig,
  supabaseRest,
} from "./supabase";

export type AdminOverview = {
  connected: boolean;
  users: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  activeStakes: number;
  totalWdc: number;
  totalUsdt: number;
  activeStakedWdc: number;
  message?: string;
};

const emptyOverview: AdminOverview = {
  connected: false,
  users: 0,
  pendingDeposits: 0,
  pendingWithdrawals: 0,
  activeStakes: 0,
  totalWdc: 0,
  totalUsdt: 0,
  activeStakedWdc: 0,
};

type RpcOverview = {
  users?: number;
  pending_deposits?: number;
  pending_withdrawals?: number;
  active_stakes?: number;
  total_wdc?: number | string;
  total_usdt?: number | string;
  active_staked_wdc?: number | string;
};

function toNumber(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  if (!getBackendConfig().configured) {
    return {
      ...emptyOverview,
      message: "Database environment variables are not connected yet.",
    };
  }

  try {
    const raw = await supabaseRest<RpcOverview | RpcOverview[]>("rpc/admin_overview", {
      method: "POST",
      body: {},
    });

    const data = Array.isArray(raw) ? raw[0] ?? {} : raw;

    return {
      connected: true,
      users: toNumber(data.users),
      pendingDeposits: toNumber(data.pending_deposits),
      pendingWithdrawals: toNumber(data.pending_withdrawals),
      activeStakes: toNumber(data.active_stakes),
      totalWdc: toNumber(data.total_wdc),
      totalUsdt: toNumber(data.total_usdt),
      activeStakedWdc: toNumber(data.active_staked_wdc),
    };
  } catch (error) {
    if (error instanceof BackendNotConfiguredError) {
      return {
        ...emptyOverview,
        message: "Database environment variables are not connected yet.",
      };
    }

    return {
      ...emptyOverview,
      message: error instanceof Error ? error.message : "Backend check failed.",
    };
  }
}


export type AdminUser = {
  id: string;
  externalUserId: string;
  displayName: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  kycStatus: string;
  createdAt: string;
};

type UserRow = {
  id?: string;
  external_user_id?: string;
  display_name?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  status?: string | null;
  kyc_status?: string | null;
  created_at?: string | null;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (!getBackendConfig().configured) return [];

  const rows = await supabaseRest<UserRow[]>(
    "users?select=id,external_user_id,display_name,email,phone,country,status,kyc_status,created_at&order=created_at.desc&limit=100"
  );

  return rows.map((row) => ({
    id: row.id ?? "",
    externalUserId: row.external_user_id ?? "",
    displayName: row.display_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    country: row.country ?? "",
    status: row.status ?? "active",
    kycStatus: row.kyc_status ?? "not_started",
    createdAt: row.created_at ?? "",
  }));
}


export type AdminDeposit = {
  id: string;
  userId: string;
  userName: string;
  email: string;
  asset: string;
  amount: number;
  txHash: string;
  status: string;
  createdAt: string;
};

export type AdminWithdrawal = {
  id: string;
  userId: string;
  userName: string;
  email: string;
  asset: string;
  amount: number;
  fee: number;
  address: string;
  txHash: string;
  status: string;
  createdAt: string;
};

export type AdminStakingPlan = {
  id: string;
  title: string;
  durationDays: number;
  dailyRate: number;
  enabled: boolean;
};

export type AdminSettings = {
  wdcReferencePrice: number;
  depositAddressBsc: string;
  depositsEnabled: boolean;
  withdrawalsEnabled: boolean;
  swapsEnabled: boolean;
  stakingEnabled: boolean;
  withdrawFeeWdc: number;
  withdrawFeeUsdt: number;
};

function adminId() {
  return process.env.WADAN_ADMIN_USER || "admin";
}

function scalar(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return "";
}

export async function getAdminDeposits(): Promise<AdminDeposit[]> {
  const rows = await supabaseRest<Array<{
    id:string;
    user_id:string;
    asset:string;
    amount:number|string;
    tx_hash?:string|null;
    status:string;
    created_at:string;
    users?:{display_name?:string|null;email?:string|null}|Array<{display_name?:string|null;email?:string|null}>;
  }>>(
    "deposits?select=id,user_id,asset,amount,tx_hash,status,created_at,users(display_name,email)&order=created_at.desc&limit=100"
  );

  return rows.map((row) => {
    const joined = Array.isArray(row.users) ? row.users[0] : row.users;
    return {
      id: row.id,
      userId: row.user_id,
      userName: joined?.display_name || "Member",
      email: joined?.email || "",
      asset: row.asset,
      amount: toNumber(row.amount),
      txHash: row.tx_hash || "",
      status: row.status,
      createdAt: row.created_at,
    };
  });
}

export async function actOnDeposit(id: string, action: "confirm" | "reject") {
  const rpc = action === "confirm" ? "confirm_deposit" : "reject_deposit";
  await supabaseRest("rpc/" + rpc, {
    method: "POST",
    body: {
      p_deposit_id: id,
      p_admin_id: adminId(),
    },
  });
}

export async function getAdminWithdrawals(): Promise<AdminWithdrawal[]> {
  const rows = await supabaseRest<Array<{
    id:string;
    user_id:string;
    asset:string;
    amount:number|string;
    fee:number|string;
    address:string;
    tx_hash?:string|null;
    status:string;
    created_at:string;
    users?:{display_name?:string|null;email?:string|null}|Array<{display_name?:string|null;email?:string|null}>;
  }>>(
    "withdrawals?select=id,user_id,asset,amount,fee,address,tx_hash,status,created_at,users(display_name,email)&order=created_at.desc&limit=100"
  );

  return rows.map((row) => {
    const joined = Array.isArray(row.users) ? row.users[0] : row.users;
    return {
      id: row.id,
      userId: row.user_id,
      userName: joined?.display_name || "Member",
      email: joined?.email || "",
      asset: row.asset,
      amount: toNumber(row.amount),
      fee: toNumber(row.fee),
      address: row.address,
      txHash: row.tx_hash || "",
      status: row.status,
      createdAt: row.created_at,
    };
  });
}

export async function actOnWithdrawal(
  id: string,
  action: "approve" | "reject" | "sent",
  txHash?: string
) {
  const rpc =
    action === "approve"
      ? "approve_withdrawal"
      : action === "reject"
        ? "reject_withdrawal"
        : "mark_withdrawal_sent";

  const body: Record<string, unknown> = {
    p_withdrawal_id: id,
    p_admin_id: adminId(),
  };

  if (action === "sent") {
    body.p_tx_hash = txHash || "";
  }

  await supabaseRest("rpc/" + rpc, {
    method: "POST",
    body,
  });
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const rows = await supabaseRest<Array<{key:string;value:unknown}>>(
    "system_settings?select=key,value"
  );
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<string, unknown>;

  return {
    wdcReferencePrice: toNumber(map.wdc_reference_price_usd) || 0.01,
    depositAddressBsc: String(scalar(map.deposit_address_bsc) || ""),
    depositsEnabled: Boolean(scalar(map.deposits_enabled)),
    withdrawalsEnabled: Boolean(scalar(map.withdrawals_enabled)),
    swapsEnabled: Boolean(scalar(map.swaps_enabled)),
    stakingEnabled: Boolean(scalar(map.staking_enabled)),
    withdrawFeeWdc: toNumber(map.withdraw_fee_wdc),
    withdrawFeeUsdt: toNumber(map.withdraw_fee_usdt),
  };
}

export async function setAdminSetting(key: string, value: unknown) {
  await supabaseRest("rpc/admin_set_setting", {
    method: "POST",
    body: {
      p_key: key,
      p_value: value,
      p_admin_id: adminId(),
    },
  });
}

export async function getAdminStakingPlans(): Promise<AdminStakingPlan[]> {
  const rows = await supabaseRest<Array<{
    id:string;
    title:string;
    duration_days:number;
    daily_rate:number|string;
    enabled:boolean;
  }>>(
    "staking_plans?select=id,title,duration_days,daily_rate,enabled&order=duration_days.asc"
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    durationDays: row.duration_days,
    dailyRate: toNumber(row.daily_rate),
    enabled: Boolean(row.enabled),
  }));
}

export async function updateAdminStakingPlan(
  id: string,
  input: { dailyRate?: number; enabled?: boolean }
) {
  const body: Record<string, unknown> = {};
  if (typeof input.dailyRate === "number" && Number.isFinite(input.dailyRate)) {
    body.daily_rate = input.dailyRate;
  }
  if (typeof input.enabled === "boolean") {
    body.enabled = input.enabled;
  }

  if (!Object.keys(body).length) return;

  await supabaseRest("staking_plans?id=eq." + encodeURIComponent(id), {
    method: "PATCH",
    body,
    prefer: "return=minimal",
  });
}
