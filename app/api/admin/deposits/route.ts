import { NextRequest, NextResponse } from "next/server";
import { actOnDeposit, getAdminDeposits } from "../../../../lib/backend/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ deposits: await getAdminDeposits() });
  } catch (error) {
    return NextResponse.json({ deposits: [], error: error instanceof Error ? error.message : "Unable to load deposits." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await actOnDeposit(String(body.id || ""), body.action);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update deposit." }, { status: 400 });
  }
}
