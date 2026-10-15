import type { Metadata } from "next";
import "./globals.css";
import { AppNav } from "@/components/nav";
import { AppFooter } from "@/components/footer";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unreadCount } from "@/lib/notifications";

export const metadata: Metadata = {
  title: "PNC Nexus",
  description: "Daftar. Tersalurkan. Berkembang.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const unread = user ? await unreadCount(prisma, user.id) : 0;
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col">
        <AppNav user={user} unread={unread} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
