import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact — Finance with Anne",
  description: "Get in touch with Anne. Ask a question, share feedback, or explore working together.",
};

const channels = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: "Email",
    value: "contact@financewithanne.com",
    href: "mailto:contact@financewithanne.com",
    color: "bg-blue-50 text-[#0822C0]",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    label: "Telegram",
    value: "Join the community",
    href: "https://t.me/+SNSQzX94_Gk1M2M0",
    color: "bg-sky-50 text-sky-600",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    label: "Book a Session",
    value: "1-on-1 coaching with Anne",
    href: "/booking",
    color: "bg-emerald-50 text-emerald-600",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#05090f]">

      {/* Hero */}
      <div className="bg-[#05148a] px-4 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Finance with Anne</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">Get in Touch</h1>
        <p className="mt-3 text-white/60 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Have a question, feedback, or want to explore working together? We'd love to hear from you.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

          {/* Left — channels */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Other ways to reach us</h2>
              <p className="text-sm text-gray-500 dark:text-white/40 mt-1">Pick whichever works best for you.</p>
            </div>

            <div className="space-y-3">
              {channels.map(c => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-white/3 p-4 hover:border-[#0822C0]/30 dark:hover:border-white/20 hover:shadow-sm transition-all"
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}>
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-white/30">{c.label}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{c.value}</p>
                  </div>
                  <svg className="h-4 w-4 text-gray-300 dark:text-white/20 group-hover:text-[#0822C0] dark:group-hover:text-white/50 shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>

            {/* Response time */}
            <div className="rounded-2xl bg-[#0822C0]/5 dark:bg-white/3 border border-[#0822C0]/10 dark:border-white/8 p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-semibold text-gray-700 dark:text-white/70">Usually responds within 24 hours</p>
              </div>
              <p className="text-xs text-gray-400 dark:text-white/30 ml-4">Monday – Friday, 9am – 6pm WAT</p>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-white/3 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Send a message</h2>
              <ContactForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
