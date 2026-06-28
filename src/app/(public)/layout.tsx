import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import StockTicker from "@/components/public/StockTicker";
import PublicThemeProvider from "@/components/public/PublicThemeProvider";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/public/CartDrawer";
import FloatingTelegramButton from "@/components/public/FloatingTelegramButton";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicThemeProvider>
      <CartProvider>
        {/* Anti-FOUC: apply stored theme class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('fwa-theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#05090f] transition-colors duration-200 overflow-x-hidden">
          <div className="sticky top-0 z-50">
            <StockTicker />
            <Navbar />
          </div>
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CartDrawer />

        {/* Floating Telegram CTA */}
        <FloatingTelegramButton />
      </CartProvider>
    </PublicThemeProvider>
  );
}
