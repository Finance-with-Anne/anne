"use client";

import { useMemo, useState } from "react";
import { parseMoney, formatMoneyInput } from "@/lib/calculators/money";

const CURRENCIES: Record<string, { label: string; symbol: string }> = {
  NGN: { label: "₦ NGN", symbol: "₦" },
  USD: { label: "$ USD", symbol: "$" },
  GBP: { label: "£ GBP", symbol: "£" },
  EUR: { label: "€ EUR", symbol: "€" },
  CAD: { label: "C$ CAD", symbol: "C$" },
  AUD: { label: "A$ AUD", symbol: "A$" },
  ZAR: { label: "R ZAR", symbol: "R" },
  GHS: { label: "₵ GHS", symbol: "₵" },
  KES: { label: "KSh KES", symbol: "KSh " },
  AED: { label: "د.إ AED", symbol: "د.إ " },
  INR: { label: "₹ INR", symbol: "₹" },
};

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function fmt(value: number, code: string) {
  return CURRENCIES[code].symbol + nf.format(Math.round(value));
}

export default function EmergencyFundCalculator() {
  const [currency, setCurrency] = useState("NGN");
  const [expensesStr, setExpensesStr] = useState("250,000");
  const [savingsStr, setSavingsStr] = useState("0");
  const [months, setMonths] = useState(6);
  const [timeline, setTimeline] = useState(12);

  const expenses = Math.max(0, parseMoney(expensesStr));
  const savings = Math.max(0, parseMoney(savingsStr));

  const { target, gap, monthlyNeeded, monthsCovered, ratio } = useMemo(() => {
    const target = expenses * months;
    const gap = Math.max(0, target - savings);
    const monthlyNeeded = timeline > 0 ? gap / timeline : gap;
    const monthsCovered = expenses > 0 ? savings / expenses : 0;
    const ratio = target > 0 ? Math.min(1, savings / target) : 0;
    return { target, gap, monthlyNeeded, monthsCovered, ratio };
  }, [expenses, savings, months, timeline]);

  let caption: React.ReactNode;
  if (gap <= 0 && target > 0) {
    caption = <>Fully funded. Your emergency fund covers {months} months of essentials. Time to move to the Builder layer.</>;
  } else if (savings <= 0) {
    caption = <>You need <b>{fmt(target, currency)}</b> to cover {months} months. Every deposit fills the runway.</>;
  } else {
    caption = <>You are covered for <b>{monthsCovered.toFixed(1)} of {months} months</b>. Keep going, <b>{fmt(gap, currency)}</b> to go.</>;
  }

  return (
    <div className="efc-calc">
      <div className="efc-wrap">
        <div className="efc-brand">
          <div className="efc-brand-mark" />
          <div className="efc-brand-name">Finance with Anne</div>
        </div>

        <div className="efc-hero">
          <span className="efc-eyebrow">Foundation Layer · Wealth Stack</span>
          <h1 className="efc-title">Emergency Fund Calculator</h1>
          <p className="efc-sub">
            Before you invest a single Naira, Dollar or Pound, build the shock absorber that keeps one bad month from becoming a bad year. Enter your essentials below and see exactly what you need, and how close you already are. <b>Works in Naira, Dollars, Pounds, Euros and more.</b>
          </p>
        </div>

        <div className="efc-grid">
          <div className="efc-card">
            <div className="efc-field">
              <div className="efc-label">Monthly essential expenses</div>
              <div className="efc-amount-row">
                <select className="efc-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {Object.entries(CURRENCIES).map(([code, c]) => (
                    <option key={code} value={code}>{c.label}</option>
                  ))}
                </select>
                <input
                  className="efc-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 250,000"
                  value={expensesStr}
                  onChange={(e) => setExpensesStr(formatMoneyInput(e.target.value))}
                />
              </div>
            </div>

            <div className="efc-field">
              <div className="efc-label">
                Current emergency savings
                <span className="efc-val">{savings > 0 ? fmt(savings, currency) : ""}</span>
              </div>
              <input
                className="efc-input"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={savingsStr}
                onChange={(e) => setSavingsStr(formatMoneyInput(e.target.value))}
              />
            </div>

            <div className="efc-field">
              <div className="efc-label">
                Target coverage
                <span className="efc-val">{months} month{months === 1 ? "" : "s"}</span>
              </div>
              <input className="efc-slider" type="range" min={3} max={12} step={1} value={months} onChange={(e) => setMonths(Number(e.target.value))} />
              <div className="efc-slider-scale"><span>3 · Just starting</span><span>12 · Fully covered</span></div>
            </div>

            <div className="efc-field">
              <div className="efc-label">
                Timeline to close the gap
                <span className="efc-val">{timeline} month{timeline === 1 ? "" : "s"}</span>
              </div>
              <input className="efc-slider" type="range" min={1} max={36} step={1} value={timeline} onChange={(e) => setTimeline(Number(e.target.value))} />
              <div className="efc-slider-scale"><span>1 month</span><span>36 months</span></div>
            </div>
          </div>

          <div className="efc-card efc-results">
            <div className="efc-result-label">Your emergency fund target</div>
            <div className="efc-result-figure">{fmt(target, currency)}</div>

            <div className="efc-runway">
              <div className="efc-runway-head"><span>MONTHS COVERED</span><span>{monthsCovered.toFixed(1)} / {months}</span></div>
              <div className="efc-runway-track">
                {Array.from({ length: months }, (_, i) => {
                  const segFillRatio = Math.max(0, Math.min(1, ratio * months - i));
                  return (
                    <div className="efc-runway-seg" key={i}>
                      <div className="efc-fill" style={{ transform: `scaleX(${segFillRatio})` }} />
                      <div className="efc-num">{i + 1}</div>
                    </div>
                  );
                })}
              </div>
              <div className="efc-runway-caption">{caption}</div>
            </div>

            <div className="efc-stat-row">
              <div className="efc-stat">
                <div className="efc-stat-label">Gap remaining</div>
                <div className="efc-stat-figure">{fmt(gap, currency)}</div>
              </div>
              <div className="efc-stat">
                <div className="efc-stat-label">Save monthly to close it</div>
                <div className="efc-stat-figure efc-good">{fmt(monthlyNeeded, currency)}</div>
              </div>
            </div>

            <div className="efc-footer-note">
              This is your <b style={{ color: "#c3cbef" }}>Foundation</b>, the first layer of the Three-Layer Wealth Stack, before Builder and Accelerator assets. Figures are estimates for planning purposes, not financial advice.
            </div>

            <a className="efc-cta" href="https://financewithanne.com/booking/one-on-one-consultation" target="_blank" rel="noopener noreferrer">
              Build your full wealth plan with Coach Anne →
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .efc-calc {
          --navy: #02133b;
          --blue: #0040cf;
          --peri: #7596f7;
          --gold: #cfb000;
          --gold-bright: #f8d300;
          --paper: #f7f8fc;
          --ink: #0b1230;
          --line: rgba(2, 19, 59, 0.1);
          font-family: var(--font-inter), sans-serif;
          background: var(--paper);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        .efc-wrap { max-width: 960px; margin: 0 auto; padding: 32px 20px 56px; }

        .efc-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .efc-brand-mark {
          width: 34px; height: 34px; border-radius: 50%;
          background: conic-gradient(from 220deg, var(--gold-bright), var(--gold), var(--blue) 60%, var(--navy));
          flex: 0 0 auto;
        }
        .efc-brand-name {
          font-family: var(--font-mono), sans-serif; font-weight: 700; font-size: 14px;
          letter-spacing: 0.06em; text-transform: uppercase; color: var(--navy);
        }

        .efc-hero { border-bottom: 1px solid var(--line); padding-bottom: 26px; margin-bottom: 30px; }
        .efc-eyebrow {
          font-family: var(--font-mono), sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--gold); background: var(--navy); display: inline-block;
          padding: 5px 10px; border-radius: 3px; margin-bottom: 14px;
        }
        .efc-title {
          font-family: var(--font-fraunces), serif; font-weight: 600; font-size: clamp(28px, 4vw, 42px);
          line-height: 1.08; margin: 0 0 12px; color: var(--navy);
        }
        .efc-sub { font-size: 15px; line-height: 1.55; color: #3a4266; max-width: 640px; margin: 0; }
        .efc-sub b { color: var(--blue); }

        .efc-grid { display: grid; grid-template-columns: 1fr 1.15fr; gap: 28px; }
        @media (max-width: 760px) { .efc-grid { grid-template-columns: 1fr; } }

        .efc-card { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 26px; }

        .efc-field { margin-bottom: 20px; }
        .efc-field:last-child { margin-bottom: 0; }
        .efc-label {
          display: flex; justify-content: space-between; align-items: baseline; font-size: 12px; font-weight: 600;
          letter-spacing: 0.04em; text-transform: uppercase; color: var(--navy); margin-bottom: 8px;
        }
        .efc-label .efc-val {
          font-family: var(--font-mono), sans-serif; font-weight: 700; color: var(--blue);
          text-transform: none; letter-spacing: 0; font-size: 13px;
        }

        .efc-calc :global(select.efc-input),
        .efc-calc :global(input.efc-input) {
          width: 100%; font-family: var(--font-mono), sans-serif; font-size: 16px; font-weight: 600; color: var(--ink);
          background: var(--paper); border: 1.5px solid var(--line); border-radius: 8px; padding: 12px 14px;
          outline: none; transition: border-color 0.15s ease;
        }
        .efc-calc :global(select.efc-input:focus),
        .efc-calc :global(input.efc-input:focus) { border-color: var(--blue); }

        .efc-amount-row { display: flex; align-items: stretch; gap: 8px; }
        .efc-amount-row :global(select) { flex: 0 0 92px; }
        .efc-amount-row :global(input) { flex: 1; }

        .efc-calc :global(input[type="range"].efc-slider) {
          -webkit-appearance: none; width: 100%; height: 6px; border-radius: 4px; background: var(--line); margin-top: 6px;
        }
        .efc-calc :global(input[type="range"].efc-slider::-webkit-slider-thumb) {
          -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--gold-bright);
          border: 3px solid var(--navy); cursor: pointer; margin-top: -7px;
        }
        .efc-calc :global(input[type="range"].efc-slider::-moz-range-thumb) {
          width: 20px; height: 20px; border-radius: 50%; background: var(--gold-bright); border: 3px solid var(--navy); cursor: pointer;
        }
        .efc-slider-scale { display: flex; justify-content: space-between; font-size: 11px; color: #8892b0; margin-top: 6px; font-family: var(--font-mono), sans-serif; }

        .efc-results { background: var(--navy); color: #fff; position: relative; overflow: hidden; }
        .efc-results::before {
          content: ""; position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(248, 211, 0, 0.18), transparent 70%);
        }
        .efc-result-label { font-family: var(--font-mono), sans-serif; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--peri); margin-bottom: 6px; }
        .efc-result-figure {
          font-family: var(--font-fraunces), serif; font-size: clamp(32px, 5vw, 46px); font-weight: 600; color: var(--gold-bright);
          line-height: 1.05; margin-bottom: 22px; word-break: break-word;
        }

        .efc-runway { margin-bottom: 22px; }
        .efc-runway-head { display: flex; justify-content: space-between; font-family: var(--font-mono), sans-serif; font-size: 12px; color: var(--peri); margin-bottom: 8px; }
        .efc-runway-track {
          position: relative; display: flex; height: 34px; border-radius: 6px; overflow: hidden;
          background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.14);
        }
        .efc-runway-seg { flex: 1; position: relative; border-right: 1px solid rgba(2, 19, 59, 0.5); }
        .efc-runway-seg:last-child { border-right: none; }
        .efc-runway-seg .efc-fill {
          position: absolute; inset: 0; background: linear-gradient(90deg, var(--gold), var(--gold-bright));
          transform-origin: left; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .efc-runway-seg .efc-num { position: absolute; right: 6px; bottom: 2px; font-family: var(--font-mono), sans-serif; font-size: 10px; color: rgba(255, 255, 255, 0.55); z-index: 2; }
        .efc-runway-caption { font-size: 13px; color: #c3cbef; margin-top: 10px; line-height: 1.5; }
        .efc-runway-caption :global(b) { color: #fff; }

        .efc-stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.14); }
        .efc-stat-label { font-family: var(--font-mono), sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--peri); margin-bottom: 4px; }
        .efc-stat-figure { font-family: var(--font-fraunces), serif; font-size: 22px; font-weight: 600; color: #fff; }
        .efc-stat-figure.efc-good { color: #8fe3a6; }

        .efc-footer-note { margin-top: 22px; font-size: 12px; color: #8892b0; line-height: 1.6; }

        .efc-cta {
          display: block; text-align: center; margin-top: 18px; background: var(--gold-bright); color: var(--navy);
          font-weight: 700; font-family: var(--font-mono), sans-serif; font-size: 13px; letter-spacing: 0.04em;
          text-transform: uppercase; padding: 13px; border-radius: 8px; text-decoration: none; transition: filter 0.15s ease;
        }
        .efc-cta:hover { filter: brightness(1.05); }
      `}</style>
    </div>
  );
}
