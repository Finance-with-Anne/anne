"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { n: "01", title: "1:1 Coaching", desc: "Personalised sessions tailored to your financial situation and goals." },
  { n: "02", title: "Money Talks", desc: "A live community where we talk money, mindset, and wealth." },
  { n: "03", title: "Courses & Resources", desc: "Self-paced learning to sharpen your financial knowledge." },
  { n: "04", title: "Stock Market Investing", desc: "Stay ahead of the market with monthly and timely stock recommendations." },
];

export default function CoreFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(labelRef.current, {
        x: -30,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: labelRef.current, start: "top 85%" },
      });

      gsap.from(cardsRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: { trigger: cardsRef.current[0], start: "top 85%" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="px-4 sm:px-6 lg:px-8 py-20"
      style={{ backgroundColor: "#06113d" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p
              ref={labelRef}
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35"
            >
              What we offer
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-10">
            {features.map((f, i) => (
              <div
                key={f.n}
                ref={(el) => { if (el) cardsRef.current[i] = el; }}
              >
                <p className="text-xs font-semibold text-white/25 mb-2">{f.n}</p>
                <h3 className="text-[15px] font-semibold text-white leading-snug">{f.title}</h3>
                <p className="mt-2 text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
