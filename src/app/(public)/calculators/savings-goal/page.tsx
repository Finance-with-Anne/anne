import { Fraunces, Inter } from "next/font/google";
import SavingsGoalCalculator from "@/components/public/calculators/SavingsGoalCalculator";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = { title: "Savings Goal | Finance with Anne" };

export default function SavingsGoalPage() {
  return (
    <div className={`${fraunces.variable} ${inter.variable}`}>
      <SavingsGoalCalculator />
    </div>
  );
}
