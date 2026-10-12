import { invalidateCached } from "./client-cache";

type SettlementResponse = {
  ok?: boolean;
  enabled?: boolean;
  result?: {
    credited_wdc?: number | string;
    stake_credited_wdc?: number | string;
    referral_rewards_credited?: number;
    bonuses_credited?: number;
  };
};

let inFlight: Promise<SettlementResponse | null> | null = null;
let lastCheckedAt = 0;

/**
 * Trigger the server-side, idempotent completed-24h reward settlement.
 * The database (not the client) is the only authority that may credit WDC.
 * The flag keeps all payouts off until the SQL migration is validated.
 */
export async function settlePendingWalletRewards(): Promise<SettlementResponse | null> {
  if (inFlight) return inFlight;
  if (Date.now() - lastCheckedAt < 30_000) return null;

  inFlight = (async () => {
    const response = await fetch("/api/staking/settle", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok) {
      // Do not suppress an actual settlement failure by displaying estimated
      // rewards as though credited; the UI still shows its ledger balances.
      return null;
    }
    const data = await response.json() as SettlementResponse;
    lastCheckedAt = Date.now();
    if (data.enabled) {
      invalidateCached("wallet:summary", "account:me", "staking:overview", "history");
    }
    return data;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}
