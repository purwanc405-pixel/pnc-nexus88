import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role, MitraStatus } from "@prisma/client";

const COOKIE = "pnc_session";
const secret = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET || "pnc-nexus-demo-secret-change-in-production-2026"
  );

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  mitraStatus?: MitraStatus | null;
  onboardingDone?: boolean;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, role?: Role) {
  let sessionRole = role;
  if (!sessionRole) {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!u) throw new Error("User tidak ditemukan.");
    sessionRole = u.role;
  }
  const token = await new SignJWT({ sub: userId, role: sessionRole })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = payload.sub;
    if (!id) return null;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { mitraProfile: true },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mitraStatus: user.mitraProfile?.status ?? null,
      onboardingDone: user.mitraProfile?.onboardingDone ?? user.role !== "mitra",
    };
  } catch {
    return null;
  }
}

export async function requireUser(roles?: Role[]) {
  const user = await getSessionUser();
  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;
  return user;
}
