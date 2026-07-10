import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/sonner-provider";
import { ThemeUpdater } from "@/components/theme-updater";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "favicon_url" } });
    if (setting?.value) return { title: "AmarFollower", description: "Social Media Marketing Panel", icons: { icon: setting.value } };
  } catch {}
  return { title: "AmarFollower", description: "Social Media Marketing Panel" };
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
