// middleware.ts — next-auth v5
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth(function middleware(req) {
  const session = req.auth;
  const path = req.nextUrl.pathname;
  const role = (session?.user as any)?.role;

  if (!session) {
    const loginUrl = new URL("/connexion", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    const response = NextResponse.redirect(loginUrl);
    if (path.includes("/postuler")) {
      response.cookies.set("login_redirect", req.url, { httpOnly: false, path: "/", maxAge: 300, sameSite: "lax" });
    }
    return response;
  }

  if (path.startsWith("/admin") && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/connexion?error=ACCES_REFUSE", req.url));
  }
  if (path.startsWith("/dashboard/rh") && role !== "RH" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/candidat", req.url));
  }
  if (path.startsWith("/dashboard/candidat") && role !== "CANDIDAT" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/rh", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/offres/:path*/postuler"],
};
