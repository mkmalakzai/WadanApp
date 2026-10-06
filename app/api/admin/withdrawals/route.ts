import { NextRequest, NextResponse } from "next/server";
import { actOnWithdrawal, getAdminWithdrawals } from "../../../../lib/backend/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ withdrawals: await getAdminWithdrawals() });
  } catch (error) {
    return NextResponse.json({ withdrawals: [], error: error instanceof Error ? error.message : "Unable to load withdrawals." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await actOnWithdrawal(String(body.id || ""), body.action, body.txHash ? String(body.txHash) : undefined);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update withdrawal." }, { status: 400 });
  }
}
