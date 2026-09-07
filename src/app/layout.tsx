import type { Metadata } from "next";
import "./globals.css";
import { AppNav } from "@/components/nav";
import { AppFooter } from "@/components/footer";
import { getSessionUser } from "@/lib/auth";

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
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col">
        <AppNav user={user} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
