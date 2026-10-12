import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "../../../../lib/backend/finance";
import { supabaseRest } from "../../../../lib/backend/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ActivePosition = { user_id: string };
type Settlement = { credited_wdc?: number | string };

export async function GET(request: NextRequest) {
  // Vercel sends Authorization: Bearer <CRON_SECRET> when configured.
  // An unset CRON_SECRET must NEVER make a payout endpoint public.
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 24) {
    return NextResponse.json({ error: "Cron secret not configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSettings(["staking_rewards_settlement_enabled"]);
  if (settings.staking_rewards_settlement_enabled !== true) {
    return NextResponse.json({ ok: true, enabled: false, credited: 0 });
  }

  // Deduplicate active positions by user before calling the DB's
  // transactional, row-locked, idempotent reward settlement RPC.
  // Initial batch is bounded to keep Vercel execution predictable.
  const positions = await supabaseRest<ActivePosition[]>(
    "stakes?select=user_id&status=eq.active&order=user_id.asc&limit=1000"
  );
  const userIds = [...new Set(positions.map((row) => row.user_id))];
  let success = 0;
  let errors = 0;
  let credited = 0;

  for (const userId of userIds) {
    try {
      const result = await supabaseRest<Settlement>("rpc/settle_wallet_rewards", {
        method: "POST",
        body: { p_user_id: userId },
      });
      credited += Number(result?.credited_wdc ?? 0);
      success += 1;
    } catch {
      errors += 1;
    }
  }

  return NextResponse.json({
    ok: errors === 0 && positions.length < 1000,
    enabled: true,
    usersChecked: userIds.length,
    successes: success,
    failures: errors,
    creditedWdc: credited,
    truncated: positions.length === 1000,
  }, { status: errors || positions.length===1000 ? 503 : 200 });
}
