import { NextRequest, NextResponse } from "next/server";
import { getWalletSummary } from "../../../../lib/backend/finance";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("wadan_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    return NextResponse.json(await getWalletSummary(token));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load wallet." },
      { status: 400 }
    );
  }
}
