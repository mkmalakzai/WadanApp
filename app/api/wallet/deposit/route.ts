import { NextRequest, NextResponse } from "next/server";
import { getDepositConfig, submitDeposit } from "../../../../lib/backend/finance";

export const dynamic = "force-dynamic";

function token(request: NextRequest) {
  return request.cookies.get("wadan_access_token")?.value;
}

export async function GET(request: NextRequest) {
  const accessToken = token(request);
  if (!accessToken) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    return NextResponse.json(await getDepositConfig(accessToken));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load deposit settings." },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  const accessToken = token(request);
  if (!accessToken) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    const body = await request.json();
    const result = await submitDeposit(accessToken, {
      asset: body.asset,
      amount: Number(body.amount),
      txHash: String(body.txHash || ""),
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit deposit." },
      { status: 400 }
    );
  }
}
