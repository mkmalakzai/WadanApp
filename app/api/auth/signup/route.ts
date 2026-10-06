import { NextResponse } from "next/server";
import { signupWithEmail } from "../../../../lib/backend/auth";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    const email = clean(body.email).toLowerCase();
    const phone = clean(body.phone);
    const country = clean(body.country);
    const password = typeof body.password === "string" ? body.password : "";
    const referralCode = clean(body.referralCode);

    if (!firstName || !lastName || !email || !country || !password) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const result = await signupWithEmail({
      firstName,
      lastName,
      email,
      phone,
      country,
      password,
      referralCode,
    });

    const response = NextResponse.json({
      ok: true,
      requiresEmailConfirmation: result.requiresEmailConfirmation,
    });

    if (result.accessToken && result.refreshToken) {
      response.cookies.set("wadan_access_token", result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: result.expiresIn ?? 3600,
      });

      response.cookies.set("wadan_refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create account." },
      { status: 400 }
    );
  }
}
