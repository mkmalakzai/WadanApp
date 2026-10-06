import { NextResponse } from "next/server";
import { getAdminUsers } from "../../../../lib/backend/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await getAdminUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      {
        users: [],
        error: error instanceof Error ? error.message : "Unable to load users.",
      },
      { status: 500 }
    );
  }
}
