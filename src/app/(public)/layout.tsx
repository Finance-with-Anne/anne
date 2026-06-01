import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import StockTicker from "@/components/public/StockTicker";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50">
        <StockTicker />
        <Navbar />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
