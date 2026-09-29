import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Admin authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="WADAN Admin"',
    },
  });
}

export function middleware(request: NextRequest) {
  const expectedUser = process.env.WADAN_ADMIN_USER;
  const expectedPassword = process.env.WADAN_ADMIN_PASSWORD;

  // Development/setup mode: do not lock the route until credentials are configured.
  if (!expectedUser || !expectedPassword) {
    return NextResponse.next();
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(":");
    const user = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);

    if (user !== expectedUser || password !== expectedPassword) {
      return unauthorized();
    }
  } catch {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
