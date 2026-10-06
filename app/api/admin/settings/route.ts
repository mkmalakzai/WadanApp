import { NextRequest, NextResponse } from "next/server";
import { getAdminSettings, setAdminSetting } from "../../../../lib/backend/admin";

export const dynamic = "force-dynamic";

const keys: Record<string,string> = {
  wdcReferencePrice: "wdc_reference_price_usd",
  depositAddressBsc: "deposit_address_bsc",
  depositsEnabled: "deposits_enabled",
  withdrawalsEnabled: "withdrawals_enabled",
  swapsEnabled: "swaps_enabled",
  stakingEnabled: "staking_enabled",
  withdrawFeeWdc: "withdraw_fee_wdc",
  withdrawFeeUsdt: "withdraw_fee_usdt",
};

export async function GET() {
  try {
    return NextResponse.json({ settings: await getAdminSettings() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load settings." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const key = keys[String(body.key || "")];
    if (!key) return NextResponse.json({ error: "Unknown setting." }, { status: 400 });
    await setAdminSetting(key, body.value);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save setting." }, { status: 400 });
  }
}
