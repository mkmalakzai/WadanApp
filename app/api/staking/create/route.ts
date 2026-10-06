import { NextRequest, NextResponse } from "next/server";
import { createStakeForUser } from "../../../../lib/backend/finance";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("wadan_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    const body = await request.json();
    const result = await createStakeForUser(token, {
      planId: String(body.planId || ""),
      amount: Number(body.amount),
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create stake." },
      { status: 400 }
    );
  }
}
