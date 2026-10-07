import { NextRequest, NextResponse } from "next/server";
import { refreshWithToken } from "../../../../lib/backend/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("wadan_refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Session ended. Please log in again." }, { status: 401 });
  }

  try {
    const result = await refreshWithToken(refreshToken);
    const response = NextResponse.json({ ok: true });

    response.cookies.set("wadan_access_token", result.accessToken ?? "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: result.expiresIn ?? 3600,
    });

    response.cookies.set("wadan_refresh_token", result.refreshToken ?? refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    const response = NextResponse.json({ error: "Session ended. Please log in again." }, { status: 401 });
    response.cookies.set("wadan_access_token", "", { httpOnly:true, secure:true, sameSite:"lax", path:"/", maxAge:0 });
    response.cookies.set("wadan_refresh_token", "", { httpOnly:true, secure:true, sameSite:"lax", path:"/", maxAge:0 });
    return response;
  }
}
