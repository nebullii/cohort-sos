import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Topbar } from "@/components/layout/topbar";
import { ShortcutListener } from "@/components/layout/shortcut-listener";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cohort SOS",
  description: "Rescue network for blocked builders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="bg-background text-foreground min-h-full font-sans">
        <StoreProvider>
          <ShortcutListener />
          <div className="flex min-h-screen flex-col">
            <Topbar />
            <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-6 md:px-6">
              {children}
            </main>
          </div>
        </StoreProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
