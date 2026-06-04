"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { n: "01", title: "1:1 Coaching", desc: "Personalised sessions tailored to your financial situation and goals." },
  { n: "02", title: "Money Talks", desc: "A live community where we talk money, mindset, and wealth." },
  { n: "03", title: "Courses & Resources", desc: "Self-paced learning to sharpen your financial knowledge." },
  { n: "04", title: "Financial Planning", desc: "Custom roadmaps to help you reach your money milestones faster." },
];

export default function CoreFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Label slides in from left
      gsap.from(labelRef.current, {
        x: -30,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: labelRef.current,
          start: "top 85%",
        },
      });

      // Feature cards stagger up
      gsap.from(cardsRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: cardsRef.current[0],
          start: "top 85%",
        },
      });

      // Bottom heading word-by-word reveal
      if (headingRef.current) {
        const words = headingRef.current.querySelectorAll(".word");
        gsap.from(words, {
          y: 50,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
          },
        });
      }

      // Description fades in
      gsap.from(descRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        delay: 0.3,
        scrollTrigger: {
          trigger: descRef.current,
          start: "top 88%",
        },
      });

      // Image box scales in
      gsap.from(imageRef.current, {
        scale: 0.92,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: imageRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const headingWords = "Everything you need to transform your finances".split(" ");

  return (
    <section
      ref={sectionRef}
      className="px-4 sm:px-6 lg:px-8 py-20"
      style={{ backgroundColor: "#06113d" }}
    >
      <div className="mx-auto max-w-6xl">

        {/* Top row */}
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

        {/* Bottom row */}
        <div className="mt-20 grid lg:grid-cols-2 gap-12 items-end">
          <div>
            <h2
              ref={headingRef}
              className="text-3xl sm:text-4xl font-bold text-white leading-snug overflow-hidden"
            >
              {headingWords.map((word, i) => (
                <span key={i} className="word inline-block mr-[0.25em]">{word}</span>
              ))}
            </h2>
            <p
              ref={descRef}
              className="mt-4 text-sm text-white/45 leading-relaxed max-w-sm"
            >
              From coaching to community, we give you the tools, knowledge, and support to take control of your money for good.
            </p>
          </div>

          <div
            ref={imageRef}
            className="rounded-2xl overflow-hidden aspect-video"
            style={{ backgroundColor: "#0d1f5c" }}
          />
        </div>

      </div>
    </section>
  );
}
