import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import StockTicker from "@/components/public/StockTicker";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <StockTicker />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
