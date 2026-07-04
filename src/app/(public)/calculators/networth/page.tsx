import { Fraunces, Inter } from "next/font/google";
import NetWorthCalculator from "@/components/public/calculators/NetWorthCalculator";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = { title: "The Net Worth Ledger | Finance with Anne" };

export default function NetWorthPage() {
  return (
    <div className={`${fraunces.variable} ${inter.variable}`}>
      <NetWorthCalculator />
    </div>
  );
}
