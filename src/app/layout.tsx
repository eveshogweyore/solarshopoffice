import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolarShopOffice | Premium Renewable Energy Solutions",
  description: "Enterprise-grade solar panels, battery storage cabinets, smart phase inverters, and expert engineering installation services.",
  keywords: ["solar panels", "commercial solar", "inverters", "battery storage", "solar shop office", "installation service"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        {/* Load Google Fonts via standard stylesheet links to prevent next/font download errors at build time */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-surface text-deep-obsidian">
        {children}
      </body>
    </html>
  );
}
