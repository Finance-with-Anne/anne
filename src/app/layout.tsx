import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finance with Anne",
  description: "Your trusted finance partner. Building wealth, one step at a time.",
  icons: {
    icon: "/fwa-dark.svg",
    shortcut: "/fwa-dark.svg",
    apple: "/fwa-dark.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${dmSans.variable}`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
