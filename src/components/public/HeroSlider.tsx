"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

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

function splitWords(text: string) {
  return text.split(" ").map((word, i) => (
    <span key={i} className="inline-block overflow-hidden leading-[1.15]">
      <span className="word-inner inline-block">{word}</span>
      {i < text.split(" ").length - 1 && <span className="inline-block">&nbsp;</span>}
    </span>
  ));
}

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const isFirstRender = useRef(true);
  const isAnimating = useRef(false);

  function animateIn() {
    if (!containerRef.current) return;
    const words = containerRef.current.querySelectorAll(".word-inner");
    const sub = subRef.current;

    gsap.fromTo(
      words,
      { y: "105%", opacity: 0 },
      {
        y: "0%",
        opacity: 1,
        duration: 0.65,
        ease: "power3.out",
        stagger: 0.055,
        onComplete: () => { isAnimating.current = false; },
      }
    );

    if (sub) {
      gsap.fromTo(
        sub,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.35 }
      );
    }
  }

  function animateOut(onComplete: () => void) {
    if (!containerRef.current) return;
    const words = containerRef.current.querySelectorAll(".word-inner");
    const sub = subRef.current;

    if (sub) gsap.to(sub, { opacity: 0, y: -8, duration: 0.25, ease: "power2.in" });

    gsap.to(words, {
      y: "-105%",
      opacity: 0,
      duration: 0.45,
      ease: "power2.in",
      stagger: 0.035,
      onComplete,
    });
  }

  // Initial entrance animation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Set words to starting position before animating in
      if (containerRef.current) {
        const words = containerRef.current.querySelectorAll(".word-inner");
        gsap.set(words, { y: "105%", opacity: 0 });
        if (subRef.current) gsap.set(subRef.current, { opacity: 0, y: 10 });
      }
      // Small delay so the page is painted
      const t = setTimeout(() => animateIn(), 100);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      animateOut(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      });
    }, 4500);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate in whenever slide index changes (except the very first render)
  const prevCurrent = useRef(-1);
  useEffect(() => {
    if (prevCurrent.current === -1) {
      prevCurrent.current = current;
      return;
    }
    if (prevCurrent.current !== current) {
      prevCurrent.current = current;
      // Set words to starting position before animating in
      if (containerRef.current) {
        const words = containerRef.current.querySelectorAll(".word-inner");
        gsap.set(words, { y: "105%", opacity: 0 });
      }
      if (subRef.current) gsap.set(subRef.current, { opacity: 0, y: 10 });
      animateIn();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const slide = slides[current];

  return (
    <div ref={containerRef}>
      <h1 className="text-3xl sm:text-4xl lg:text-[4rem] font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
        <span className="block">{splitWords(slide.line1)}</span>
        <span className="block">{splitWords(slide.line2)}</span>
      </h1>
      <p ref={subRef} className="mt-5 text-gray-500 dark:text-white/45 text-base sm:text-lg leading-relaxed max-w-[620px]">
        {slide.sub}
      </p>
    </div>
  );
}
