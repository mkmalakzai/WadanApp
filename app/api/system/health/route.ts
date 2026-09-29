import { NextResponse } from "next/server";
import { getBackendConfig } from "../../../../lib/backend/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getBackendConfig();

  return NextResponse.json({
    ok: true,
    backendConfigured: config.configured,
    database: config.configured ? "supabase-postgres" : "not-connected",
    timestamp: new Date().toISOString(),
  });
}
