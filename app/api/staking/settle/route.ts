import { NextRequest, NextResponse } from "next/server";
import {
  getSettings,
  settleStakingRewardsForUser,
} from "../../../../lib/backend/finance";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("wadan_access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // The SQL migration must be applied and payouts explicitly enabled.
  // Never call an undeployed RPC or claim that a reward was credited.
  try {
    const settings = await getSettings(["staking_rewards_settlement_enabled"]);
    if (settings.staking_rewards_settlement_enabled !== true) {
      return NextResponse.json({
        ok: true,
        enabled: false,
        result: { credited_wdc: 0, settled_positions: 0 },
      });
    }

    const result = await settleStakingRewardsForUser(token);
    return NextResponse.json({ ok: true, enabled: true, result });
  } catch {
    return NextResponse.json(
      { error: "Reward settlement is unavailable. No balance was credited." },
      { status: 503 }
    );
  }
}
