import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "pnc_session";

type SessionInfo = { ok: true; role?: string } | { ok: false };

async function readSession(req: NextRequest): Promise<SessionInfo> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return { ok: false };
  try {
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET ||
        "pnc-nexus-demo-secret-change-in-production-2026"
    );
    const { payload } = await jwtVerify(token, secret);
    const role = typeof payload.role === "string" ? payload.role : undefined;
    return { ok: true, role };
  } catch {
    return { ok: false };
  }
}

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
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
  "/notifikasi",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = protectedPrefixes.some((p) => matchesPrefix(pathname, p));
  if (!needsAuth) return NextResponse.next();

  const session = await readSession(req);
  if (!session.ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/masuk";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const role = session.role;
  const deny = (to = "/ringkasan") => {
    const url = req.nextUrl.clone();
    url.pathname = to;
    url.search = "";
    return NextResponse.redirect(url);
  };

  // Role gates (edge): do not rely only on page redirects
  // /admin → admin only
  // /pipeline + /mitra (direktori) → admin | operator
  // Sessions without role claim must re-login for gated routes
  if (matchesPrefix(pathname, "/admin")) {
    if (role !== "admin") {
      if (!role) {
        const url = req.nextUrl.clone();
        url.pathname = "/masuk";
        url.search = "";
        return NextResponse.redirect(url);
      }
      return deny("/ringkasan");
    }
  }

  if (
    matchesPrefix(pathname, "/pipeline") ||
    matchesPrefix(pathname, "/mitra")
  ) {
    if (role !== "admin" && role !== "operator") {
      if (!role) {
        const url = req.nextUrl.clone();
        url.pathname = "/masuk";
        url.search = "";
        return NextResponse.redirect(url);
      }
      return deny("/ringkasan");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/ringkasan",
    "/ringkasan/:path*",
    "/profil",
    "/profil/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/kerja",
    "/kerja/:path*",
    "/komoditi",
    "/komoditi/:path*",
    "/pemerintahan",
    "/pemerintahan/:path*",
    "/mitra",
    "/mitra/:path*",
    "/pipeline",
    "/pipeline/:path*",
    "/admin",
    "/admin/:path*",
    "/notifikasi",
    "/notifikasi/:path*",
  ],
};
