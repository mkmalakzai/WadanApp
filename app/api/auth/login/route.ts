import { NextResponse } from "next/server";
import { loginWithEmail } from "../../../../lib/backend/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }

    const result = await loginWithEmail(email, password);

    const response = NextResponse.json({ ok: true });

    response.cookies.set("wadan_access_token", result.accessToken ?? "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: result.expiresIn ?? 3600,
    });

    response.cookies.set("wadan_refresh_token", result.refreshToken ?? "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to log in." },
      { status: 401 }
    );
  }
}
