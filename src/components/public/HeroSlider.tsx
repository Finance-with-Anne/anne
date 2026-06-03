"use client";

import { useState, useEffect } from "react";

const slides = [
  {
    headline: "Secure Your Financial Future",
    sub: "Simple, practical strategies to help you earn more, budget better, save consistently, and invest with confidence.",
  },
  {
    headline: "Build Wealth With Clarity & Intention",
    sub: "Clear guidance, real strategies, and practical steps to help you grow financially without confusion.",
  },
  {
    headline: "Master Money With Confidence",
    sub: "Actionable advice and easy-to-follow frameworks to help you manage your money effectively and confidently.",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  return (
    <div
      className="transition-opacity duration-400"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}
    >
      <h1 className="text-4xl sm:text-5xl lg:text-[2.75rem] font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
        {slide.headline}
      </h1>
      <p className="mt-6 text-gray-500 dark:text-white/45 text-base leading-relaxed max-w-[520px]">
        {slide.sub}
      </p>
    </div>
  );
}
