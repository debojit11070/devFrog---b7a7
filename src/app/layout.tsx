import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ChatWidget } from "@/components/ai/chat-widget";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "DevForge | Developer Assessment Platform",
    template: "%s | DevForge",
  },
  description:
    "Run structured technical assessments. Companies build and publish coding, written and multiple-choice tests; candidates take them and get evaluated.",
  openGraph: {
    type: "website",
    siteName: "DevForge",
    title: "DevForge | Developer Assessment Platform",
    description: "Hire with real, structured developer assessments.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:shadow-lg"
        >
          Skip to content
        </a>
        <AppProviders>
          {children}
          <ChatWidget />
        </AppProviders>
      </body>
    </html>
  );
}
