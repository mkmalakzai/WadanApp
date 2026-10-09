import { NextRequest, NextResponse } from "next/server";
import { settleStakingRewardsForUser } from "../../../../lib/backend/finance";

export const dynamic = "force-dynamic";

// Credits completed 24-hour rewards exactly once via the locked DB transaction.
// Identity is derived from the verified auth session, never from request input.
export async function POST(request: NextRequest) {
  const token = request.cookies.get("wadan_access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const result = await settleStakingRewardsForUser(token);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unable to settle rewards.",
    }, { status: 400 });
  }
}
