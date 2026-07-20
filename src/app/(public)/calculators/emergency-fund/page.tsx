import { Fraunces, Inter, Space_Grotesk } from "next/font/google";
import EmergencyFundCalculator from "@/components/public/calculators/EmergencyFundCalculator";

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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Emergency Fund Calculator | Finance with Anne",
  description: "Work out exactly how big your emergency fund needs to be, how close you are, and what to save monthly to close the gap.",
};

export default function EmergencyFundPage() {
  return (
    <div className={`${fraunces.variable} ${inter.variable} ${spaceGrotesk.variable}`}>
      <EmergencyFundCalculator />
    </div>
  );
}
