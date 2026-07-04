import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import CompoundInterestCalculator from "@/components/public/calculators/CompoundInterestCalculator";

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
  weight: ["500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = { title: "Compound Interest Calculator | Finance with Anne" };

export default function CompoundInterestPage() {
  return (
    <div className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <CompoundInterestCalculator />
    </div>
  );
}
