import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/sonner-provider";
import { ThemeUpdater } from "@/components/theme-updater";
import { prisma } from "@/lib/prisma";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl: string | undefined;
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "favicon_url" } });
    if (setting?.value) faviconUrl = setting.value;
  } catch {}
  return {
    title: "AmarFollower",
    description: "Social Media Marketing Panel",
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <ThemeUpdater />
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
