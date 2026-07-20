import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import TreasuryBillCalculator from "@/components/public/calculators/TreasuryBillCalculator";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Treasury Bill Calculator | Finance with Anne",
  description: "Calculate your Treasury Bill discount, purchase price, maturity value and true yield — built by Finance with Anne.",
};

export default function TreasuryBillPage() {
  return (
    <div className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <TreasuryBillCalculator />
    </div>
  );
}
