import { NextResponse } from "next/server";
import { getAdminOverview } from "@/lib/backend/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const overview = await getAdminOverview();
  return NextResponse.json(overview, {
    status: overview.connected || !overview.message ? 200 : 200,
  });
}
