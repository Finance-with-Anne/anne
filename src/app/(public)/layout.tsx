import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import StockTicker from "@/components/public/StockTicker";
import PublicThemeProvider from "@/components/public/PublicThemeProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicThemeProvider>
      {/* Anti-FOUC: apply stored theme class before first paint */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('fwa-theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`,
        }}
      />
      <div className="flex min-h-screen flex-col bg-white dark:bg-[#05090f] transition-colors duration-200">
        <div className="sticky top-0 z-50">
          <StockTicker />
          <Navbar />
        </div>
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </PublicThemeProvider>
  );
}
