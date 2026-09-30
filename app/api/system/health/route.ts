import { NextResponse } from "next/server";
import { getBackendConfig } from "../../../../lib/backend/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getBackendConfig();

  const adminProtected = Boolean(
    process.env.WADAN_ADMIN_USER && process.env.WADAN_ADMIN_PASSWORD
  );

  return NextResponse.json({
    ok: true,
    backendConfigured: config.configured,
    adminProtected,
    database: config.configured ? "supabase-postgres" : "not-connected",
    timestamp: new Date().toISOString(),
  });
}
