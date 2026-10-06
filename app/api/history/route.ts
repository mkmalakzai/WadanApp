import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "../../../lib/backend/finance";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("wadan_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    return NextResponse.json({ rows: await getHistory(token) });
  } catch (error) {
    return NextResponse.json(
      { rows: [], error: error instanceof Error ? error.message : "Unable to load history." },
      { status: 400 }
    );
  }
}
