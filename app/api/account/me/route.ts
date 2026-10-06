import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccountProfile } from "../../../../lib/backend/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("wadan_access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const profile = await getCurrentAccountProfile(token);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load account." },
      { status: 401 }
    );
  }
}
