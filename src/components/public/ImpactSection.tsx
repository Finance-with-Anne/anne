"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  {
    value: "80%",
    description:
      "trainees move from living paycheck-to-paycheck to building financial stability.",
  },
  {
    value: "4 Cores",
    description:
      "The financial pillars Anne teaches to help people build lasting wealth.",
  },
  {
    value: "₦500M+",
    description:
      "Saved and invested by members of the Finance With Anne community",
  },
];

// Chart dimensions (viewBox 0 0 1440 220)
// Year positions: 2021 → x=430, 2023 → x=800, 2025 → x=1160
const SOLID_PATH =
  "M 60 185 C 180 185 300 45 430 54 C 520 60 545 165 630 165 C 705 165 730 44 800 54 C 862 61 895 148 978 148 C 1045 148 1090 25 1160 35 C 1200 40 1240 32 1290 30";

const DASHED_PATH =
  "M 60 190 C 180 190 308 56 428 67 C 505 75 528 175 615 173 C 688 171 716 58 785 67 C 845 74 880 155 958 153 C 1022 152 1066 44 1132 54 C 1168 60 1210 58 1380 62";

const HIGHLIGHT_DOTS = [
  { cx: 430, cy: 54 },
  { cx: 800, cy: 54 },
  { cx: 1160, cy: 35 },
];

export default function ImpactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const clipRectRef = useRef<SVGRectElement>(null);
  const dotsRef = useRef<(SVGCircleElement | null)[]>([]);
  const openDotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const clipRect = clipRectRef.current;
    if (!clipRect) return;

    gsap.set(clipRect, { attr: { width: 0 } });
    const allDots = [...dotsRef.current, openDotRef.current].filter(Boolean);
    gsap.set(allDots, { scale: 0, transformOrigin: "center", opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 72%",
        once: true,
      },
    });

    tl.to(clipRect, { attr: { width: 1440 }, duration: 2.2, ease: "power2.inOut" }, 0)
      .to(allDots, {
        scale: 1,
        opacity: 1,
        duration: 0.38,
        stagger: 0.28,
        ease: "back.out(2.5)",
      }, 0.8);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#070F1E] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 pt-14 sm:pt-20 pb-0">

        {/* Stats row */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-8 sm:gap-0">

          {/* Label */}
          <div className="sm:pr-10 sm:shrink-0 sm:pt-1">
            <svg
              className="w-5 h-5 text-yellow-400 mb-4"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.8}
              strokeLinecap="round"
            >
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
            <p className="text-white/50 text-sm">My Business Impact</p>
          </div>

          {/* Three stats separated by dividers */}
          <div className="flex flex-col sm:flex-row sm:flex-1 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {stats.map((stat) => (
              <div key={stat.value} className="sm:flex-1 sm:px-10 py-5 sm:py-0">
                <p className="text-4xl sm:text-5xl font-light text-white tracking-tight mb-2">
                  {stat.value}
                </p>
                <p className="text-white/45 text-sm leading-relaxed max-w-[230px]">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart — full bleed */}
      <div className="mt-8">
        <svg
          viewBox="0 0 1440 220"
          className="w-full block"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="impact-chart-reveal">
              <rect ref={clipRectRef} x="0" y="0" width="0" height="220" />
            </clipPath>
          </defs>

          {/* X-axis baseline */}
          <line
            x1="60" y1="190" x2="1420" y2="190"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1"
          />

          {/* Year ticks + labels */}
          {[
            { x: 430, label: "2021" },
            { x: 800, label: "2023" },
            { x: 1160, label: "2025" },
          ].map(({ x, label }) => (
            <g key={label}>
              <line
                x1={x} y1="187" x2={x} y2="194"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />
              <text
                x={x} y="212"
                textAnchor="middle"
                fill="rgba(255,255,255,0.30)"
                fontSize="13"
              >
                {label}
              </text>
            </g>
          ))}

          {/* Animated chart lines + dots */}
          <g clipPath="url(#impact-chart-reveal)">
            {/* Dashed path */}
            <path
              d={DASHED_PATH}
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.5"
              strokeDasharray="7 5"
            />

            {/* Solid path */}
            <path
              d={SOLID_PATH}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Highlight dots on solid line */}
            {HIGHLIGHT_DOTS.map((dot, i) => (
              <circle
                key={i}
                ref={(el) => { dotsRef.current[i] = el; }}
                cx={dot.cx}
                cy={dot.cy}
                r="6"
                fill="#22D3EE"
                stroke="white"
                strokeWidth="2"
              />
            ))}

            {/* Open projection circle at end of dashed line */}
            <circle
              ref={openDotRef}
              cx="1380"
              cy="62"
              r="5"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      </div>
    </section>
  );
}
