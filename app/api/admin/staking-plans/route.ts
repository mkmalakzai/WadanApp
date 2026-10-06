import { NextRequest, NextResponse } from "next/server";
import { getAdminStakingPlans, updateAdminStakingPlan } from "../../../../lib/backend/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ plans: await getAdminStakingPlans() });
  } catch (error) {
    return NextResponse.json({ plans: [], error: error instanceof Error ? error.message : "Unable to load plans." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await updateAdminStakingPlan(String(body.id || ""), {
      dailyRate: typeof body.dailyRate === "number" ? body.dailyRate : undefined,
      enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update plan." }, { status: 400 });
  }
}
