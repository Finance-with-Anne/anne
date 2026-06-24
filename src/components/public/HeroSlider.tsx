"use client";

import { useState, useEffect } from "react";

const slides = [
  {
    line1: "Secure Your",
    line2: "Financial Future",
    sub: "Simple, practical strategies to help you earn more, budget better, save consistently, and invest with confidence.",
  },
  {
    line1: "Build Wealth With",
    line2: "Clarity & Intention",
    sub: "Clear guidance, real strategies, and practical steps to help you grow financially without confusion.",
  },
  {
    line1: "Master Money",
    line2: "With Confidence",
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
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}
    >
      <h1 className="text-6xl sm:text-7xl lg:text-[5rem] font-bold text-gray-900 dark:text-white leading-[1.05] tracking-tight">
        {slide.line1}<br />{slide.line2}
      </h1>
      <p className="mt-8 text-gray-500 dark:text-white/45 text-xl leading-relaxed max-w-[620px]">
        {slide.sub}
      </p>
    </div>
  );
}
