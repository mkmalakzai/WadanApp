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
