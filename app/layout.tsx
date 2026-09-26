import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Curiosity Travel | Travel Portal",
  description:
    "Plan trips, manage travel rates and create branded itinerary quotations with Curiosity Travel.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
