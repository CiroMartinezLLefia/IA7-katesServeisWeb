import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Protect backoffice paths
  if (path.startsWith("/backoffice")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // 1. Check if user is logged in
    if (!token) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
      return NextResponse.redirect(signInUrl);
    }

    const role = token.role;

    // 2. Enforce role-based access
    if (path.startsWith("/backoffice/users")) {
      // ADMIN only
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } else {
      // EDITOR or ADMIN only
      if (role !== "ADMIN" && role !== "EDITOR") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/backoffice/:path*"],
};
