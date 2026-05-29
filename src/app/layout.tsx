import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANNE — Finance Platform",
  description: "Your trusted finance partner. Building wealth, one step at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
