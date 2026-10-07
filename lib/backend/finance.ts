import { getCurrentAccountProfile } from "./auth";
import { supabaseRest } from "./supabase";

type Asset = "WDC" | "USDT";

type SettingRow = {
  key: string;
  value: unknown;
};

type LedgerRow = {
  id: string;
  asset: Asset;
  direction: "credit" | "debit";
  amount: number | string;
  entry_type: string;
  reference_type?: string | null;
  reference_id?: string | null;
  balance_after: number | string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
};

type StakeRow = {
  id: string;
  plan_id: string;
  principal: number | string;
  accrued_reward: number | string;
  started_at: string;
  unlock_at: string;
  status: string;
};

type PlanRow = {
  id: string;
  title: string;
  duration_days: number;
  daily_rate: number | string;
  enabled: boolean;
};

function scalar(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return "";
}

function toNumber(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

export async function getSettings(keys?: string[]) {
  const path = keys?.length
    ? `system_settings?select=key,value&key=in.(${keys.map((key) => encodeURIComponent(key)).join(",")})`
    : "system_settings?select=key,value";

  const rows = await supabaseRest<SettingRow[]>(path);
  return Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<string, unknown>;
}

export async function getWalletSummary(accessToken: string) {
  const profile = await getCurrentAccountProfile(accessToken);

  const [ledger, settings, stakes] = await Promise.all([
    supabaseRest<LedgerRow[]>(
      `ledger_entries?user_id=eq.${encodeURIComponent(profile.appUserId)}&select=id,asset,direction,amount,entry_type,reference_type,reference_id,balance_after,metadata,created_at&order=created_at.desc&limit=10`
    ),
    getSettings(["wdc_reference_price_usd","withdrawals_enabled","deposits_enabled","swaps_enabled"]),
    supabaseRest<StakeRow[]>(
      `stakes?user_id=eq.${encodeURIComponent(profile.appUserId)}&status=eq.active&select=id,plan_id,principal,accrued_reward,started_at,unlock_at,status&order=started_at.desc`
    ),
  ]);

  const wdcPrice = toNumber(settings.wdc_reference_price_usd) || 0.01;
  const totalStaked = stakes.reduce((sum, stake) => sum + toNumber(stake.principal), 0);

  return {
    profile,
    wdcPrice,
    totalUsd: profile.usdtBalance + profile.wdcBalance * wdcPrice,
    totalStaked,
    flags: {
      deposits: Boolean(scalar(settings.deposits_enabled)),
      withdrawals: Boolean(scalar(settings.withdrawals_enabled)),
      swaps: Boolean(scalar(settings.swaps_enabled)),
    },
    recent: ledger.map((row) => ({
      id: row.id,
      asset: row.asset,
      direction: row.direction,
      amount: toNumber(row.amount),
      type: row.entry_type,
      balanceAfter: toNumber(row.balance_after),
      createdAt: row.created_at,
    })),
  };
}

export async function getDepositConfig(accessToken: string) {
  const profile = await getCurrentAccountProfile(accessToken);
  const settings = await getSettings(["deposit_address_bsc","deposits_enabled"]);

  return {
    profile,
    enabled: Boolean(scalar(settings.deposits_enabled)),
    address: String(scalar(settings.deposit_address_bsc) || ""),
    network: "BNB Smart Chain • BEP-20",
  };
}

export async function submitDeposit(
  accessToken: string,
  input: { asset: Asset; amount: number; txHash: string }
) {
  const profile = await getCurrentAccountProfile(accessToken);
  const settings = await getSettings(["deposits_enabled","deposit_address_bsc"]);

  if (!Boolean(scalar(settings.deposits_enabled))) {
    throw new Error("Deposits are currently disabled.");
  }

  if (!String(scalar(settings.deposit_address_bsc) || "")) {
    throw new Error("Deposit address is not configured yet.");
  }

  if (!["WDC","USDT"].includes(input.asset)) {
    throw new Error("Unsupported deposit asset.");
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Enter a valid deposit amount.");
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(input.txHash.trim())) {
    throw new Error("Enter a valid BNB Chain transaction hash.");
  }

  const rows = await supabaseRest<Array<{ id: string }>>("deposits", {
    method: "POST",
    body: {
      user_id: profile.appUserId,
      asset: input.asset,
      network: "BSC",
      amount: input.amount,
      tx_hash: input.txHash.trim(),
      status: "pending",
    },
    prefer: "return=representation",
  });

  return { id: rows?.[0]?.id ?? "", status: "pending" };
}

export async function requestWithdrawalForUser(
  accessToken: string,
  input: { asset: Asset; amount: number; address: string }
) {
  const profile = await getCurrentAccountProfile(accessToken);
  const settings = await getSettings([
    "withdrawals_enabled",
    input.asset === "WDC" ? "withdraw_fee_wdc" : "withdraw_fee_usdt",
  ]);

  if (!Boolean(scalar(settings.withdrawals_enabled))) {
    throw new Error("Withdrawals are currently disabled.");
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(input.address.trim())) {
    throw new Error("Enter a valid BNB Smart Chain address.");
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Enter a valid withdrawal amount.");
  }

  const feeKey = input.asset === "WDC" ? "withdraw_fee_wdc" : "withdraw_fee_usdt";
  const fee = toNumber(settings[feeKey]);

  const result = await supabaseRest<string | { request_withdrawal?: string }>(
    "rpc/request_withdrawal",
    {
      method: "POST",
      body: {
        p_user_id: profile.appUserId,
        p_asset: input.asset,
        p_amount: input.amount,
        p_fee: fee,
        p_address: input.address.trim(),
        p_network: "BSC",
      },
    }
  );

  return { id: typeof result === "string" ? result : result?.request_withdrawal ?? "", fee };
}

export async function executeSwapForUser(
  accessToken: string,
  input: { fromAsset: Asset; amount: number }
) {
  const profile = await getCurrentAccountProfile(accessToken);

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Enter a valid swap amount.");
  }

  return supabaseRest<Record<string, unknown> | Array<Record<string, unknown>>>(
    "rpc/execute_swap",
    {
      method: "POST",
      body: {
        p_user_id: profile.appUserId,
        p_from_asset: input.fromAsset,
        p_amount: input.amount,
      },
    }
  );
}

export async function getStakingOverview(accessToken: string) {
  const profile = await getCurrentAccountProfile(accessToken);

  const [plans, stakes] = await Promise.all([
    supabaseRest<PlanRow[]>(
      "staking_plans?select=id,title,duration_days,daily_rate,enabled&order=duration_days.asc"
    ),
    supabaseRest<StakeRow[]>(
      `stakes?user_id=eq.${encodeURIComponent(profile.appUserId)}&select=id,plan_id,principal,accrued_reward,started_at,unlock_at,status&order=started_at.desc`
    ),
  ]);

  const planMap = new Map(plans.map((plan) => [plan.id, plan]));

  const now = Date.now();

  const positions = stakes.map((stake) => {
    const plan = planMap.get(stake.plan_id);
    const principal = toNumber(stake.principal);
    const dailyRate = toNumber(plan?.daily_rate);
    const durationDays = Number(plan?.duration_days ?? 0);
    const started = new Date(stake.started_at).getTime();
    const unlock = new Date(stake.unlock_at).getTime();
    const elapsedMs = Math.max(0, now - started);
    const elapsedDays = elapsedMs / 86400000;
    const completedDays = Math.min(Math.floor(elapsedDays), durationDays);
    const completedDays24hAgo = Math.min(
      Math.floor(Math.max(0, elapsedMs - 86400000) / 86400000),
      durationDays
    );
    const dailyProfit = principal * (dailyRate / 100);
    const last24hProfit =
      stake.status === "active"
        ? dailyProfit * Math.max(0, completedDays - completedDays24hAgo)
        : 0;
    const totalProjectedProfit = dailyProfit * durationDays;
    const storedReward = toNumber(stake.accrued_reward);
    const earnedProfit =
      stake.status === "unlocked"
        ? Math.max(storedReward, totalProjectedProfit)
        : dailyProfit * completedDays;
    const progressPercent =
      durationDays > 0
        ? Math.min(100, Math.max(0, (elapsedDays / durationDays) * 100))
        : 0;
    const remainingPercent = Math.max(0, 100 - progressPercent);
    const daysRemaining = Math.max(0, durationDays - completedDays);
    const matured = now >= unlock;

    return {
      ...stake,
      principal,
      accruedReward: storedReward,
      planTitle: plan?.title ?? stake.plan_id,
      dailyRate,
      durationDays,
      dailyProfit,
      last24hProfit,
      earnedProfit,
      totalProjectedProfit,
      completedDays,
      daysRemaining,
      progressPercent,
      remainingPercent,
      projectedReward: earnedProfit,
      matured,
    };
  });

  const activePositions = positions.filter((position) => position.status === "active");
  const summary = {
    totalStaked: activePositions.reduce((sum, position) => sum + position.principal, 0),
    todayProfit: activePositions.reduce(
      (sum, position) => sum + position.last24hProfit,
      0
    ),
    allProfit: positions.reduce((sum, position) => sum + position.earnedProfit, 0),
    expectedProfit: activePositions.reduce(
      (sum, position) => sum + position.totalProjectedProfit,
      0
    ),
    activeCount: activePositions.length,
  };

  return {
    profile,
    plans: plans.map((plan) => ({
      ...plan,
      dailyRate: toNumber(plan.daily_rate),
    })),
    positions,
    summary,
  };
}

export async function createStakeForUser(
  accessToken: string,
  input: { planId: string; amount: number }
) {
  const profile = await getCurrentAccountProfile(accessToken);

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Enter a valid staking amount.");
  }

  const result = await supabaseRest<string | { create_stake?: string }>("rpc/create_stake", {
    method: "POST",
    body: {
      p_user_id: profile.appUserId,
      p_plan_id: input.planId,
      p_principal: input.amount,
    },
  });

  return { id: typeof result === "string" ? result : result?.create_stake ?? "" };
}

export async function claimStakeForUser(accessToken: string, stakeId: string) {
  const profile = await getCurrentAccountProfile(accessToken);

  return supabaseRest<Record<string, unknown> | Array<Record<string, unknown>>>(
    "rpc/claim_matured_stake",
    {
      method: "POST",
      body: { p_stake_id: stakeId, p_user_id: profile.appUserId },
    }
  );
}

export type HistoryItem = {
  id: string;
  type: "deposit" | "withdraw" | "swap" | "staking" | "referral";
  title: string;
  asset: string;
  amount: number;
  status: string;
  date: string;
};

export async function getHistory(accessToken: string): Promise<HistoryItem[]> {
  const profile = await getCurrentAccountProfile(accessToken);
  const id = encodeURIComponent(profile.appUserId);

  const [deposits, withdrawals, swaps, stakes, rewards] = await Promise.all([
    supabaseRest<Array<{id:string;asset:string;amount:number|string;status:string;created_at:string}>>(
      `deposits?user_id=eq.${id}&select=id,asset,amount,status,created_at&order=created_at.desc&limit=100`
    ),
    supabaseRest<Array<{id:string;asset:string;amount:number|string;status:string;created_at:string}>>(
      `withdrawals?user_id=eq.${id}&select=id,asset,amount,status,created_at&order=created_at.desc&limit=100`
    ),
    supabaseRest<Array<{id:string;from_asset:string;to_asset:string;from_amount:number|string;to_amount:number|string;status:string;created_at:string}>>(
      `swaps?user_id=eq.${id}&select=id,from_asset,to_asset,from_amount,to_amount,status,created_at&order=created_at.desc&limit=100`
    ),
    supabaseRest<Array<{id:string;principal:number|string;status:string;started_at:string}>>(
      `stakes?user_id=eq.${id}&select=id,principal,status,started_at&order=started_at.desc&limit=100`
    ),
    supabaseRest<Array<{id:string;asset:string;amount:number|string;status:string;created_at:string}>>(
      `referral_rewards?beneficiary_user_id=eq.${id}&select=id,asset,amount,status,created_at&order=created_at.desc&limit=100`
    ),
  ]);

  const rows: HistoryItem[] = [
    ...deposits.map((row) => ({
      id: row.id,
      type: "deposit" as const,
      title: "Deposit",
      asset: row.asset,
      amount: toNumber(row.amount),
      status: row.status,
      date: row.created_at,
    })),
    ...withdrawals.map((row) => ({
      id: row.id,
      type: "withdraw" as const,
      title: "Withdrawal",
      asset: row.asset,
      amount: -toNumber(row.amount),
      status: row.status,
      date: row.created_at,
    })),
    ...swaps.map((row) => ({
      id: row.id,
      type: "swap" as const,
      title: `${row.from_asset} → ${row.to_asset}`,
      asset: row.to_asset,
      amount: toNumber(row.to_amount),
      status: row.status,
      date: row.created_at,
    })),
    ...stakes.map((row) => ({
      id: row.id,
      type: "staking" as const,
      title: "Staking",
      asset: "WDC",
      amount: -toNumber(row.principal),
      status: row.status,
      date: row.started_at,
    })),
    ...rewards.map((row) => ({
      id: row.id,
      type: "referral" as const,
      title: "Referral reward",
      asset: row.asset,
      amount: toNumber(row.amount),
      status: row.status,
      date: row.created_at,
    })),
  ];

  return rows.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getReferralOverviewForUser(accessToken: string) {
  const profile = await getCurrentAccountProfile(accessToken);

  const raw = await supabaseRest<Record<string, unknown> | Array<Record<string, unknown>>>(
    "rpc/get_referral_overview",
    {
      method: "POST",
      body: { p_user_id: profile.appUserId },
    }
  );

  return Array.isArray(raw) ? raw[0] ?? {} : raw;
}
