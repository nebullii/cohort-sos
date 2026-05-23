import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { ThemeProvider } from "@/lib/theme";
import { ShortcutListener } from "@/components/layout/shortcut-listener";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cohort SOS · Rescue network for Cursor Boston Summer 1",
  description:
    "Built for Cursor Boston's Summer Cohort. Unblock stuck builders in minutes. Every fix becomes searchable cohort memory.",
  openGraph: {
    title: "Cohort SOS · Cursor Boston Summer 1",
    description:
      "Built for Cursor Boston's Summer Cohort. Unblock stuck builders in minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground min-h-full font-sans">
        <ThemeProvider>
          <StoreProvider>
            <ShortcutListener />
            {children}
          </StoreProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
