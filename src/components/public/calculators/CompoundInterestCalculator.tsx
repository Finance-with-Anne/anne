"use client";

import { useMemo, useState } from "react";
import { parseMoney, formatMoneyInput } from "@/lib/calculators/money";

type Currency = { code: string; symbol: string; name: string };

const CURRENCIES: Currency[] = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "XOF", symbol: "CFA", name: "West African CFA Franc" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha" },
];

const COMPOUNDING_OPTIONS = [
  { value: "1", label: "Annually" },
  { value: "2", label: "Semiannually" },
  { value: "4", label: "Quarterly" },
  { value: "12", label: "Monthly" },
  { value: "365", label: "Daily" },
];

function fmtNum(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function rangeFill(min: number, max: number, val: number) {
  return `${((val - min) / (max - min)) * 100}%`;
}

export default function CompoundInterestCalculator() {
  const [currency, setCurrency] = useState("NGN");
  const [principal, setPrincipal] = useState("500,000");
  const [monthly, setMonthly] = useState("100,000");
  const [years, setYears] = useState("15");
  const [rate, setRate] = useState("12");
  const [compounding, setCompounding] = useState("12");

  const cur = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  const principalVal = parseMoney(principal);
  const monthlyVal = parseMoney(monthly);
  const yearsVal = Math.max(1, parseMoney(years));
  const rateVal = parseMoney(rate);
  const n = Number(compounding);

  const { points, finalBalance, contributed, interest } = useMemo(() => {
    const annualRate = rateVal / 100;
    const effAnnual = Math.pow(1 + annualRate / n, n) - 1;
    const monthlyRate = Math.pow(1 + effAnnual, 1 / 12) - 1;

    const pts: { month: number; balance: number; contributed: number }[] = [];
    let balance = principalVal;
    let contrib = principalVal;
    pts.push({ month: 0, balance, contributed: contrib });
    const totalMonths = yearsVal * 12;
    for (let m = 1; m <= totalMonths; m++) {
      balance = balance * (1 + monthlyRate) + monthlyVal;
      contrib += monthlyVal;
      if (m % 12 === 0 || m === totalMonths) {
        pts.push({ month: m, balance, contributed: contrib });
      }
    }
    return { points: pts, finalBalance: balance, contributed: contrib, interest: balance - contrib };
  }, [principalVal, monthlyVal, yearsVal, rateVal, n]);

  const chart = useMemo(() => {
    const W = 600, H = 200, padB = 10;
    const maxVal = Math.max(...points.map((p) => p.balance), 1);
    const count = points.length;
    const x = (i: number) => (i / (count - 1)) * W;
    const y = (v: number) => H - padB - (v / maxVal) * (H - 10 - padB);

    const balPath = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.balance).toFixed(1)}`).join(" ");
    const contribPath = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.contributed).toFixed(1)}`).join(" ");
    const areaClose = ` L${x(count - 1).toFixed(1)},${H - padB} L${x(0).toFixed(1)},${H - padB} Z`;

    return { balPath, contribPath, areaPath: balPath + areaClose };
  }, [points]);

  return (
    <div className="ci-calc">
      <div className="wrap">
        <h1>Compound Interest Calculator</h1>
        <p className="sub">Find out how much your savings could grow over time through the power of compounding, in Naira or whatever currency you save in.</p>
        <p className="req-note"><b>*</b> Denotes a required field</p>

        {/* STEP 1 */}
        <div className="step">
          <div className="step-head"><span className="step-num">1</span><span className="step-title">Initial Investment</span></div>
          <div className="field">
            <label className="field-label">Currency *</label>
            <p className="field-help">Choose the currency you&apos;re saving or investing in.</p>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol}), {c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Initial Investment *</label>
            <p className="field-help">The amount of money you have available to invest right now.</p>
            <div className="input-row">
              <span className="prefix">{cur.symbol}</span>
              <input className="num-input" type="text" inputMode="numeric" value={principal} onChange={(e) => setPrincipal(formatMoneyInput(e.target.value))} />
            </div>
            <input
              type="range" min={0} max={20000000} step={10000} value={principalVal}
              onChange={(e) => setPrincipal(fmtNum(Number(e.target.value)))}
              style={{ ["--fill" as string]: rangeFill(0, 20000000, principalVal) }}
            />
          </div>
        </div>

        {/* STEP 2 */}
        <div className="step">
          <div className="step-head"><span className="step-num">2</span><span className="step-title">Contribute</span></div>
          <div className="field">
            <label className="field-label">Monthly Contribution *</label>
            <p className="field-help">What you plan to add to the principal every month. Enter a negative number if you plan to withdraw instead.</p>
            <div className="input-row">
              <span className="prefix">{cur.symbol}</span>
              <input className="num-input" type="text" inputMode="numeric" value={monthly} onChange={(e) => setMonthly(formatMoneyInput(e.target.value))} />
            </div>
            <input
              type="range" min={0} max={2000000} step={5000} value={monthlyVal}
              onChange={(e) => setMonthly(fmtNum(Number(e.target.value)))}
              style={{ ["--fill" as string]: rangeFill(0, 2000000, monthlyVal) }}
            />
          </div>
          <div className="field">
            <label className="field-label">Length of Time in Years *</label>
            <p className="field-help">How many years you plan to keep saving before you touch this money.</p>
            <div className="input-row">
              <span className="prefix">Yrs</span>
              <input className="num-input" type="text" inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
            <input
              type="range" min={1} max={40} step={1} value={yearsVal}
              onChange={(e) => setYears(e.target.value)}
              style={{ ["--fill" as string]: rangeFill(1, 40, yearsVal) }}
            />
          </div>
        </div>

        {/* STEP 3 */}
        <div className="step">
          <div className="step-head"><span className="step-num">3</span><span className="step-title">Interest Rate</span></div>
          <div className="field">
            <label className="field-label">Estimated Interest Rate *</label>
            <p className="field-help">Your expected annual rate of return.</p>
            <div className="input-row">
              <span className="prefix">%</span>
              <input className="num-input" type="text" inputMode="numeric" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^0-9.]/g, ""))} />
            </div>
            <input
              type="range" min={1} max={30} step={0.5} value={rateVal}
              onChange={(e) => setRate(e.target.value)}
              style={{ ["--fill" as string]: rangeFill(1, 30, rateVal) }}
            />
          </div>
        </div>

        {/* STEP 4 */}
        <div className="step">
          <div className="step-head"><span className="step-num">4</span><span className="step-title">Compound It</span></div>
          <div className="field">
            <label className="field-label">Compound Frequency *</label>
            <p className="field-help">How often interest is calculated and added to your balance.</p>
            <select className="plain-select" value={compounding} onChange={(e) => setCompounding(e.target.value)}>
              {COMPOUNDING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* RESULTS */}
        <div className="results">
          <div className="results-label">Balance after {yearsVal} years</div>
          <div className="results-figure"><span className="cur">{cur.symbol}</span>{fmtNum(finalBalance)}</div>

          <div className="chart-wrap">
            <svg viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F8D300" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F8D300" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={chart.areaPath} fill="url(#goldFill)" stroke="none" />
              <path d={chart.contribPath} fill="none" stroke="#7596F7" strokeWidth={2} strokeDasharray="4 4" opacity={0.85} />
              <path d={chart.balPath} fill="none" stroke="#F8D300" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="legend">
              <span><i className="sw" style={{ background: "var(--gold)" }} />Total balance</span>
              <span><i className="sw" style={{ background: "var(--periwinkle)" }} />Total contributed</span>
            </div>
          </div>

          <div className="breakdown">
            <div className="b-cell">
              <div className="b-label">Initial investment</div>
              <div className="b-value">{cur.symbol}{fmtNum(principalVal)}</div>
            </div>
            <div className="b-cell">
              <div className="b-label">Total contributions</div>
              <div className="b-value">{cur.symbol}{fmtNum(contributed - principalVal)}</div>
            </div>
            <div className="b-cell">
              <div className="b-label">Interest earned</div>
              <div className="b-value">{cur.symbol}{fmtNum(interest)}</div>
            </div>
          </div>
        </div>

        <p className="footnote">This tool is for illustration only. It assumes a constant rate of return, which real investments rarely deliver, since markets move up and down. Use it to build intuition around consistency and time, not to predict actual results. Speak to a licensed advisor before making investment decisions.</p>

        <div className="brandline"><b>Finance with Anne</b>. Helping You Build Generational Wealth.</div>
      </div>

      <style jsx>{`
        .ci-calc {
          --navy: #02133b;
          --royal: #0040cf;
          --periwinkle: #7596f7;
          --gold-deep: #cfb000;
          --gold: #f8d300;
          --paper: #f6f5f0;
          --line: #e1dfd6;
          --muted: #5b6072;
          background: var(--paper);
          color: var(--navy);
          font-family: var(--font-inter), sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .wrap { max-width: 760px; margin: 0 auto; padding: 56px 24px 90px; }

        .ci-calc h1 {
          font-family: var(--font-fraunces), serif; font-weight: 600; font-size: clamp(30px, 4.6vw, 42px);
          line-height: 1.08; margin: 0 0 12px; letter-spacing: -0.01em; color: var(--navy);
        }
        .sub { font-size: 16px; line-height: 1.6; color: var(--muted); max-width: 560px; margin: 0 0 8px; }
        .req-note { font-size: 12.5px; color: var(--muted); margin: 18px 0 40px; font-weight: 600; letter-spacing: 0.02em; }
        .req-note b { color: var(--royal); }

        .step { border-top: 1px solid var(--line); padding: 36px 0; }
        .step:first-of-type { border-top: 2px solid var(--navy); }

        .step-head { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
        .step-num {
          width: 28px; height: 28px; border-radius: 50%; background: var(--navy); color: var(--gold);
          display: flex; align-items: center; justify-content: center; font-family: var(--font-mono), monospace;
          font-size: 13px; font-weight: 600; flex-shrink: 0;
        }
        .step-title { font-family: var(--font-fraunces), serif; font-weight: 600; font-size: 21px; color: var(--navy); }

        .field { margin-bottom: 26px; }
        .field:last-child { margin-bottom: 0; }
        .field-label { font-size: 14.5px; font-weight: 700; color: var(--navy); margin-bottom: 6px; display: block; }
        .field-help { font-size: 13.5px; color: var(--muted); line-height: 1.55; margin: 0 0 10px; max-width: 520px; }

        .input-row { display: flex; align-items: stretch; max-width: 340px; }
        .prefix {
          display: flex; align-items: center; justify-content: center; padding: 0 12px;
          background: var(--navy); color: var(--gold); font-family: var(--font-mono), monospace; font-size: 14px;
          border-radius: 8px 0 0 8px; min-width: 44px;
        }
        .num-input {
          flex: 1; border: 1.5px solid var(--line); border-left: none; border-radius: 0 8px 8px 0;
          padding: 11px 12px; font-family: var(--font-mono), monospace; font-size: 15px; color: var(--navy);
          background: #fff; outline: none;
        }
        .num-input:focus { border-color: var(--royal); }

        select {
          width: 100%; max-width: 340px; border: 1.5px solid var(--line); border-radius: 8px; padding: 11px 14px;
          font-family: var(--font-inter), sans-serif; font-size: 15px; color: var(--navy); background: #fff;
          appearance: none; -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2302133B' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; outline: none;
        }
        select:focus { border-color: var(--royal); }

        .plain-select { max-width: 220px; }

        input[type="range"] {
          -webkit-appearance: none; width: 100%; max-width: 340px; height: 4px; border-radius: 2px; margin-top: 14px; display: block;
          background: linear-gradient(90deg, var(--royal) 0%, var(--royal) var(--fill, 50%), var(--line) var(--fill, 50%), var(--line) 100%);
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--gold);
          border: 3px solid var(--navy); cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%; background: var(--gold); border: 3px solid var(--navy); cursor: pointer;
        }

        .results { margin-top: 20px; background: var(--navy); border-radius: 16px; padding: 36px 32px; color: var(--paper); }
        .results-label { font-family: var(--font-mono), monospace; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--periwinkle); }
        .results-figure {
          font-family: var(--font-fraunces), serif; font-weight: 600; font-size: clamp(36px, 5vw, 50px); color: var(--gold);
          line-height: 1; margin: 8px 0 26px;
        }
        .results-figure .cur { font-size: 0.48em; color: var(--periwinkle); margin-right: 6px; }

        .chart-wrap { margin: 0 0 22px; }
        .chart-wrap svg { width: 100%; height: auto; display: block; }
        .legend { display: flex; gap: 20px; font-size: 12px; color: rgba(246, 245, 240, 0.6); margin-top: 10px; }
        .legend span { display: flex; align-items: center; gap: 6px; }
        .legend .sw { width: 10px; height: 10px; border-radius: 2px; }

        .breakdown { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(246, 245, 240, 0.14); border: 1px solid rgba(246, 245, 240, 0.14); border-radius: 12px; overflow: hidden; }
        .b-cell { background: rgba(246, 245, 240, 0.04); padding: 16px 14px; }
        .b-label { font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; color: rgba(246, 245, 240, 0.6); margin-bottom: 7px; }
        .b-value { font-family: var(--font-mono), monospace; font-size: 16px; color: var(--paper); }

        .footnote { margin-top: 34px; font-size: 12.5px; line-height: 1.6; color: var(--muted); }
        .brandline { margin-top: 26px; font-family: var(--font-mono), monospace; font-size: 12px; color: var(--muted); }
        .brandline b { color: var(--royal); }
      `}</style>
    </div>
  );
}
