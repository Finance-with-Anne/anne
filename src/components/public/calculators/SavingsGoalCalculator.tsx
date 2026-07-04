"use client";

import { useState } from "react";
import { parseMoney, formatMoneyInput } from "@/lib/calculators/money";

type Frequency = "daily" | "weekly" | "monthly" | "annually";

const SYMBOLS: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", CAD: "C$", EUR: "€" };
const LOCALES: Record<string, string> = { NGN: "en-NG", USD: "en-US", GBP: "en-GB", CAD: "en-CA", EUR: "de-DE" };

const FREQUENCIES: { id: Frequency; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "annually", label: "Annually" },
];

type ClimbData = { kind: "flat" } | { kind: "track"; points: number[] };

type Result = {
  alreadyThere: boolean;
  headline: string;
  dateLine: string;
  contributed: number;
  interest: number;
  final: number;
  climb: ClimbData;
};

function periodsPerYear(f: Frequency) {
  if (f === "daily") return 365;
  if (f === "weekly") return 52;
  if (f === "monthly") return 12;
  return 1;
}

function buildClimbPath(climb: ClimbData) {
  const svgW = 500, svgH = 92, pad = 14;

  if (climb.kind === "flat") {
    return {
      d: `M ${pad} ${svgH - pad} L ${svgW - pad} ${pad}`,
      startX: pad, startY: svgH - pad,
      goalX: svgW - pad, goalY: pad,
    };
  }

  const track = climb.points;
  const n = track.length;
  const maxV = Math.max(...track);
  const minV = Math.min(...track);
  const range = maxV - minV || 1;

  const step = Math.max(1, Math.floor(n / 60));
  const pts: number[] = [];
  for (let i = 0; i < n; i += step) pts.push(track[i]);
  if (pts[pts.length - 1] !== track[n - 1]) pts.push(track[n - 1]);

  let d = "";
  pts.forEach((v, i) => {
    const x = pad + (i / (pts.length - 1)) * (svgW - pad * 2);
    const y = svgH - pad - ((v - minV) / range) * (svgH - pad * 2);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  const startY = svgH - pad - ((pts[0] - minV) / range) * (svgH - pad * 2);
  const goalY = svgH - pad - ((pts[pts.length - 1] - minV) / range) * (svgH - pad * 2);

  return { d, startX: pad, startY, goalX: svgW - pad, goalY };
}

export default function SavingsGoalCalculator() {
  const [currency, setCurrency] = useState("NGN");
  const [rate, setRate] = useState("10");
  const [current, setCurrent] = useState("200,000");
  const [goal, setGoal] = useState("5,000,000");
  const [deposit, setDeposit] = useState("100,000");
  const [freq, setFreq] = useState<Frequency>("monthly");
  const [result, setResult] = useState<Result | null>(null);
  const [warn, setWarn] = useState(false);
  const [runId, setRunId] = useState(0);

  const sym = SYMBOLS[currency];

  function fmtMoney(n: number) {
    return sym + Math.round(n).toLocaleString(LOCALES[currency] ?? "en-US");
  }

  function calc() {
    const currentVal = parseMoney(current);
    const goalVal = parseMoney(goal);
    const depositVal = parseMoney(deposit);
    const annualRate = parseFloat(rate) || 0;

    if (currentVal >= goalVal) {
      setWarn(false);
      setResult({
        alreadyThere: true,
        headline: "You're already there!",
        dateLine: "Your current savings already meet this goal.",
        contributed: currentVal,
        interest: 0,
        final: currentVal,
        climb: { kind: "flat" },
      });
      setRunId((id) => id + 1);
      return;
    }

    const ppy = periodsPerYear(freq);
    const r = Math.pow(1 + annualRate / 100, 1 / ppy) - 1;

    let balance = currentVal;
    let periods = 0;
    const maxPeriods = ppy * 100;
    const track = [balance];

    while (balance < goalVal && periods < maxPeriods) {
      balance = balance * (1 + r) + depositVal;
      periods++;
      track.push(balance);
    }

    if (periods >= maxPeriods && balance < goalVal) {
      setResult(null);
      setWarn(true);
      return;
    }

    setWarn(false);

    const years = periods / ppy;
    const wholeYears = Math.floor(years);
    const months = Math.round((years - wholeYears) * 12);

    let headline;
    if (wholeYears === 0) {
      headline = `${months} month${months === 1 ? "" : "s"}`;
    } else if (months === 0) {
      headline = `${wholeYears} year${wholeYears === 1 ? "" : "s"}`;
    } else {
      headline = `${wholeYears} yr${wholeYears === 1 ? "" : "s"} ${months} mo`;
    }

    const target = new Date();
    target.setMonth(target.getMonth() + Math.round(years * 12));
    const dateStr = target.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const totalContributed = currentVal + depositVal * periods;
    const interestEarned = balance - totalContributed;

    setResult({
      alreadyThere: false,
      headline,
      dateLine: `Around ${dateStr}, at this pace.`,
      contributed: totalContributed,
      interest: interestEarned,
      final: balance,
      climb: { kind: "track", points: track },
    });
    setRunId((id) => id + 1);
  }

  const climbPath = result ? buildClimbPath(result.climb) : null;

  return (
    <div className="sg-calc">
      <div className="wrap">
        <div className="eyebrow">Finance with Anne</div>
        <h1>Savings <em>Goal</em></h1>
        <p className="subtitle">How long to save</p>

        <div className="card">
          <div className="row">
            <div className="field currency-select">
              <label htmlFor="currency">Currency</label>
              <div className="input-shell">
                <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="NGN">₦ Naira (NGN)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="GBP">£ Pound Sterling (GBP)</option>
                  <option value="CAD">C$ Canadian Dollar (CAD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="rate">Annual interest / return (%)</label>
              <div className="input-shell">
                <input type="number" id="rate" value={rate} onChange={(e) => setRate(e.target.value)} min={0} step={0.1} />
                <span className="prefix">%</span>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label htmlFor="current">Current savings</label>
              <div className="input-shell">
                <span className="prefix">{sym}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="money-input"
                  id="current"
                  value={current}
                  onChange={(e) => setCurrent(formatMoneyInput(e.target.value))}
                  onBlur={() => { if (current.trim() === "") setCurrent("0"); }}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="goal">Savings goal</label>
              <div className="input-shell">
                <span className="prefix">{sym}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="money-input"
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(formatMoneyInput(e.target.value))}
                  onBlur={() => { if (goal.trim() === "") setGoal("0"); }}
                />
              </div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="deposit">Regular deposit amount</label>
            <div className="input-shell">
              <span className="prefix">{sym}</span>
              <input
                type="text"
                inputMode="numeric"
                className="money-input"
                id="deposit"
                value={deposit}
                onChange={(e) => setDeposit(formatMoneyInput(e.target.value))}
                onBlur={() => { if (deposit.trim() === "") setDeposit("0"); }}
              />
            </div>
          </div>

          <div className="field">
            <label>Deposit frequency</label>
            <div className="freq-toggle">
              {FREQUENCIES.map((f) => (
                <div
                  key={f.id}
                  className={`freq-btn${freq === f.id ? " active" : ""}`}
                  onClick={() => setFreq(f.id)}
                >
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          <button className="calc-btn" onClick={calc}>Calculate my timeline</button>

          {result && (
            <div className="result show">
              <div className="result-label">You&apos;ll reach your goal in</div>
              <div className="result-headline">{result.headline}</div>
              <div className="result-date">{result.dateLine}</div>

              {climbPath && (
                <svg className="climb" viewBox="0 0 500 92" preserveAspectRatio="none">
                  <path key={runId} className="line" d={climbPath.d} />
                  <circle className="start-dot" r="4" cx={climbPath.startX} cy={climbPath.startY} />
                  <circle className="goal-dot" r="5" cx={climbPath.goalX} cy={climbPath.goalY} />
                </svg>
              )}

              <div className="stats">
                <div className="stat">
                  <div className="k">Total contributed</div>
                  <div className="v">{fmtMoney(result.contributed)}</div>
                </div>
                <div className="stat">
                  <div className="k">Interest earned</div>
                  <div className="v">{fmtMoney(result.interest)}</div>
                </div>
                <div className="stat">
                  <div className="k">Final balance</div>
                  <div className="v">{fmtMoney(result.final)}</div>
                </div>
              </div>
            </div>
          )}

          {warn && (
            <div className="warn show">
              At this rate, your goal isn&apos;t reached within 100 years. Try increasing your regular deposit or interest rate.
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .sg-calc {
          --navy: #02133b;
          --navy-soft: #071a4a;
          --blue: #0040cf;
          --periwinkle: #7596f7;
          --gold: #cfb000;
          --gold-bright: #f8d300;
          --ink: #eaf0ff;
          --ink-dim: #a9b8e6;
          background:
            radial-gradient(1100px 600px at 15% -10%, rgba(117, 150, 247, 0.2), transparent 60%),
            radial-gradient(900px 500px at 110% 10%, rgba(248, 211, 0, 0.1), transparent 55%),
            var(--navy);
          color: var(--ink);
          font-family: var(--font-inter), sans-serif;
          min-height: 100vh;
          padding: 48px 20px 72px;
        }

        .wrap { max-width: 620px; margin: 0 auto; }

        .eyebrow {
          display: flex; align-items: center; gap: 10px;
          font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--gold-bright); font-weight: 600; margin-bottom: 18px;
        }
        .eyebrow::before { content: ""; width: 22px; height: 2px; background: var(--gold-bright); display: inline-block; }

        .sg-calc h1 {
          font-family: var(--font-fraunces), serif; font-weight: 700; font-size: clamp(34px, 6vw, 50px);
          line-height: 1.05; margin: 0 0 8px; color: #fff;
        }
        .sg-calc h1 em { font-style: normal; font-weight: 900; color: var(--periwinkle); text-shadow: 0 0 26px rgba(117, 150, 247, 0.45); }

        .subtitle { font-size: 17px; color: var(--periwinkle); font-weight: 500; margin: 0 0 40px; }

        .card {
          background: linear-gradient(180deg, rgba(117, 150, 247, 0.1), rgba(117, 150, 247, 0.03));
          border: 1px solid rgba(117, 150, 247, 0.28);
          border-radius: 18px; padding: 30px 26px 26px; position: relative; overflow: hidden;
        }
        .card::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--gold), var(--gold-bright), var(--blue));
        }

        .field { margin-bottom: 18px; }
        .field label {
          display: block; font-size: 12.5px; font-weight: 600; letter-spacing: 0.03em;
          color: var(--ink-dim); margin-bottom: 7px; text-transform: uppercase;
        }

        .row { display: flex; gap: 14px; }
        .row .field { flex: 1; min-width: 0; }

        .input-shell {
          display: flex; align-items: stretch; background: rgba(2, 19, 59, 0.55);
          border: 1px solid rgba(117, 150, 247, 0.35); border-radius: 10px; overflow: hidden;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .input-shell:focus-within { border-color: var(--gold-bright); box-shadow: 0 0 0 3px rgba(248, 211, 0, 0.15); }
        .input-shell .prefix {
          display: flex; align-items: center; justify-content: center; padding: 0 12px;
          background: rgba(117, 150, 247, 0.14); color: var(--periwinkle); font-weight: 600;
          font-size: 15px; min-width: 46px;
        }
        .input-shell input, .input-shell select {
          width: 100%; border: 0; background: transparent; color: #fff;
          font-family: var(--font-inter), sans-serif; font-size: 16px; font-weight: 600;
          padding: 13px 12px; outline: none; appearance: none; -webkit-appearance: none;
        }
        .input-shell select { cursor: pointer; }
        .input-shell select option { background: var(--navy); color: #fff; }

        .freq-toggle { display: flex; gap: 8px; }
        .freq-btn {
          flex: 1; padding: 11px 4px; text-align: center; border-radius: 9px;
          border: 1px solid rgba(117, 150, 247, 0.35); background: rgba(2, 19, 59, 0.4);
          color: var(--ink-dim); font-family: var(--font-inter), sans-serif; font-size: 12.5px;
          font-weight: 600; cursor: pointer; transition: all 0.15s ease;
        }
        .freq-btn.active { background: var(--blue); border-color: var(--blue); color: #fff; }

        .calc-btn {
          width: 100%; margin-top: 10px; padding: 16px; border: 0; border-radius: 12px;
          background: linear-gradient(90deg, var(--gold), var(--gold-bright)); color: var(--navy);
          font-family: var(--font-inter), sans-serif; font-weight: 700; font-size: 15.5px;
          letter-spacing: 0.01em; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 8px 24px rgba(207, 176, 0, 0.18);
        }
        .calc-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(248, 211, 0, 0.28); }
        .calc-btn:active { transform: translateY(0); }

        .result { margin-top: 26px; padding-top: 26px; border-top: 1px dashed rgba(117, 150, 247, 0.3); }
        .result.show { animation: rise 0.5s ease; }
        @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .result-label { font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-dim); font-weight: 600; margin-bottom: 6px; }
        .result-headline {
          font-family: var(--font-fraunces), serif; font-weight: 700; font-size: clamp(30px, 6vw, 42px);
          color: var(--gold-bright); line-height: 1.08; margin-bottom: 6px;
        }
        .result-date { color: var(--periwinkle); font-size: 15px; font-weight: 500; margin-bottom: 22px; }

        .climb { width: 100%; height: 92px; margin-bottom: 22px; display: block; }
        .climb :global(path.line) {
          fill: none; stroke: var(--gold-bright); stroke-width: 2.5; stroke-linecap: round;
          stroke-dasharray: 500; stroke-dashoffset: 500; animation: draw 1.1s ease forwards 0.1s;
        }
        @keyframes draw { to { stroke-dashoffset: 0; } }
        .climb :global(.goal-dot) { fill: var(--gold-bright); }
        .climb :global(.start-dot) { fill: var(--periwinkle); }

        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .stat { background: rgba(2, 19, 59, 0.5); border: 1px solid rgba(117, 150, 247, 0.22); border-radius: 12px; padding: 14px 12px; }
        .stat .k { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-dim); font-weight: 600; margin-bottom: 6px; }
        .stat .v { font-family: var(--font-fraunces), serif; font-weight: 600; font-size: 18px; color: #fff; }

        .warn { margin-top: 26px; padding-top: 26px; border-top: 1px dashed rgba(117, 150, 247, 0.3); color: var(--periwinkle); font-size: 14.5px; line-height: 1.5; }

        @media (max-width: 480px) {
          .row { flex-direction: column; gap: 0; }
          .stats { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
