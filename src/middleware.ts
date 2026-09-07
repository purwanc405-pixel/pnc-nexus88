import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "pnc_session";

async function hasSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET ||
        "pnc-nexus-demo-secret-change-in-production-2026"
    );
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

const protectedPrefixes = [
  "/ringkasan",
  "/profil",
  "/onboarding",
  "/kerja",
  "/komoditi",
  "/pemerintahan",
  "/mitra",
  "/pipeline",
  "/admin",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!needsAuth) return NextResponse.next();
  if (!(await hasSession(req))) {
    const url = req.nextUrl.clone();
    url.pathname = "/masuk";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/ringkasan/:path*",
    "/profil/:path*",
    "/onboarding/:path*",
    "/kerja/:path*",
    "/komoditi/:path*",
    "/pemerintahan/:path*",
    "/mitra/:path*",
    "/pipeline/:path*",
    "/admin/:path*",
  ],
};
