import { NextResponse } from "next/server";
import { getBackendConfig } from "../../../../lib/backend/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getBackendConfig();

  const adminProtected = Boolean(
    process.env.WADAN_ADMIN_USER && process.env.WADAN_ADMIN_PASSWORD
  );
  const authConfigured = Boolean(process.env.SUPABASE_PUBLISHABLE_KEY);

  return NextResponse.json({
    ok: true,
    backendConfigured: config.configured,
    authConfigured,
    adminProtected,
    database: config.configured ? "supabase-postgres" : "not-connected",
    timestamp: new Date().toISOString(),
  });
}
