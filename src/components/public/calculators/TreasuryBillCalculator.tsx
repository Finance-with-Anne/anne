"use client";

import { useMemo, useState } from "react";
import { parseMoney, formatMoneyInput } from "@/lib/calculators/money";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d;
}

const nf = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function TreasuryBillCalculator() {
  const [investStr, setInvestStr] = useState("1,000,000");
  const [rateStr, setRateStr] = useState("18.50");
  const [settleDate, setSettleDate] = useState(todayISO);
  const [daysStr, setDaysStr] = useState("182");

  const consideration = parseMoney(investStr);
  const ratePct = parseMoney(rateStr);
  const days = Math.min(364, Math.max(2, Math.round(parseMoney(daysStr) || 1)));

  const { faceValue, discount, trueYield, maturityDate } = useMemo(() => {
    const rate = ratePct / 100;
    // Discount is applied to Face Value on a 365-day basis (Nigerian market convention):
    // consideration = faceValue * (1 - rate * days/365)  =>  faceValue = consideration / (1 - rate * days/365)
    const denom = 1 - (rate * days) / 365;
    const fv = denom > 0 ? consideration / denom : consideration;
    const disc = fv - consideration;
    const yld = consideration > 0 ? (disc / consideration) * (365 / days) * 100 : 0;
    return {
      faceValue: fv,
      discount: disc,
      trueYield: yld,
      maturityDate: addDays(settleDate, days),
    };
  }, [consideration, ratePct, days, settleDate]);

  return (
    <div className="tb-calc">
      <div className="wrap">
        <div className="eyebrow">Finance with Anne · Tools</div>
        <h1>Treasury Bill Calculator</h1>
        <p className="sub">Work out exactly what you&apos;ll pay today, what you&apos;ll collect at maturity, and the true yield behind the headline discount rate on any FGN Treasury Bill.</p>

        <div className="grid">
          <div className="card">
            <div className="field">
              <label htmlFor="investAmount">Amount to Invest (what you pay today)</label>
              <div className="prefix-input">
                <span>₦</span>
                <input
                  id="investAmount"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={investStr}
                  onChange={(e) => setInvestStr(formatMoneyInput(e.target.value))}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="discountRate">Discount Rate</label>
              <div className="prefix-input suffix">
                <input
                  id="discountRate"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={rateStr}
                  onChange={(e) => setRateStr(e.target.value.replace(/[^0-9.]/g, ""))}
                />
                <span>%</span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="settleDate">Settlement (Purchase) Date</label>
              <input id="settleDate" type="date" value={settleDate} onChange={(e) => setSettleDate(e.target.value || todayISO())} />
            </div>

            <div className="field">
              <label htmlFor="customDays">Days to Maturity</label>
              <input id="customDays" type="text" inputMode="numeric" value={daysStr} onChange={(e) => setDaysStr(e.target.value.replace(/[^0-9]/g, ""))} />
              <p className="hint">Nigerian T-Bills are sold at a discount and settle on a 365-day year. Enter any tenor from 2 to 364 days.</p>
            </div>
          </div>

          <div>
            <div className="cert">
              <div className="cert-inner">
                <svg className="cert-border-svg" viewBox="0 0 400 500" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gEdge" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#F8D300" stopOpacity="0.5" />
                      <stop offset="1" stopColor="#F8D300" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <rect x="6" y="6" width="388" height="488" rx="10" fill="none" stroke="url(#gEdge)" strokeWidth="1" />
                </svg>

                <div className="cert-head">
                  <div>
                    <div className="label">Federal Government of Nigeria</div>
                    <div className="instrument">Treasury Bill</div>
                  </div>
                  <div className="cert-serial">
                    SETTLE {formatDate(new Date(settleDate + "T00:00:00")).toUpperCase()}
                    <br />
                    MATURE {formatDate(maturityDate).toUpperCase()}
                  </div>
                </div>

                <div className="cert-face">
                  <div className="fv-label">Amount you pay today</div>
                  <div className="fv-amount">₦{nf.format(Math.round(consideration))}</div>
                </div>

                <div className="cert-rows">
                  <div className="cert-row">
                    <div className="k">Days to maturity</div>
                    <div className="v">{days} {days === 1 ? "day" : "days"}</div>
                  </div>
                  <div className="cert-row highlight">
                    <div className="k">Discount earned</div>
                    <div className="v">₦{nf.format(Math.round(discount))}</div>
                  </div>
                  <div className="cert-row total">
                    <div className="k">Face Value (you receive at maturity)</div>
                    <div className="v">₦{nf.format(Math.round(faceValue))}</div>
                  </div>
                  <div className="cert-row">
                    <div className="k">True yield (annualised)</div>
                    <div className="v">{nf2.format(trueYield)}%</div>
                  </div>
                </div>

                <div className="cert-foot">Quoted rate {nf2.format(ratePct)}% · {days}-day tenor · 365-day basis</div>
              </div>
            </div>

            <div className="note">
              <strong>Why true yield is higher than the discount rate:</strong> the discount rate is applied to the face value you receive at maturity, not to the smaller amount you actually pay today. True yield restates your return against your real cost, so it&apos;s the number to compare against savings accounts, money market funds, or other bills.
            </div>
          </div>
        </div>
      </div>

      <footer>Educational tool, not investment advice</footer>

      <style jsx>{`
        .tb-calc {
          --navy: #02133b;
          --royal: #0040cf;
          --peri: #7596f7;
          --gold: #cfb000;
          --gold-bright: #f8d300;
          --paper: #f7f8fc;
          --ink: #0d1530;
          --line: rgba(2, 19, 59, 0.12);
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-inter), sans-serif;
          line-height: 1.5;
          padding: 32px 16px 80px;
        }

        .wrap { max-width: 920px; margin: 0 auto; }

        .eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--royal);
          display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
        }
        .eyebrow::before { content: ""; width: 22px; height: 1px; background: var(--gold); display: inline-block; }

        .tb-calc h1 {
          font-family: var(--font-fraunces), serif; font-weight: 600; font-size: clamp(28px, 4.4vw, 42px);
          color: var(--navy); margin: 0 0 10px; letter-spacing: -0.01em;
        }
        .sub { max-width: 60ch; color: rgba(13, 21, 48, 0.68); font-size: 15.5px; margin-bottom: 36px; }

        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
        @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }

        .card { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 26px; }

        .field { margin-bottom: 20px; }
        .field:last-child { margin-bottom: 0; }

        label { display: block; font-size: 12.5px; font-weight: 600; letter-spacing: 0.02em; color: var(--navy); margin-bottom: 7px; }

        input[type="text"], input[type="date"] {
          width: 100%; padding: 11px 13px; border: 1.5px solid var(--line); border-radius: 9px;
          font-family: var(--font-mono), monospace; font-size: 15px; color: var(--ink); background: #fff;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        input[type="text"]:focus, input[type="date"]:focus {
          outline: none; border-color: var(--royal); box-shadow: 0 0 0 3px rgba(0, 64, 207, 0.12);
        }

        .prefix-input {
          display: flex; align-items: stretch; border: 1.5px solid var(--line); border-radius: 9px; overflow: hidden;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .prefix-input:focus-within { border-color: var(--royal); box-shadow: 0 0 0 3px rgba(0, 64, 207, 0.12); }
        .prefix-input span {
          display: flex; align-items: center; padding: 0 12px; background: var(--paper); color: var(--royal);
          font-family: var(--font-mono), monospace; font-weight: 600; font-size: 15px; border-right: 1.5px solid var(--line);
        }
        .prefix-input input { border: none; border-radius: 0; flex: 1; }
        .prefix-input input:focus { box-shadow: none; }
        .prefix-input.suffix span { border-right: none; border-left: 1.5px solid var(--line); order: 2; }

        .hint { font-size: 12px; color: rgba(13, 21, 48, 0.5); margin-top: 6px; }

        .cert { position: relative; background: linear-gradient(180deg, var(--navy) 0%, #051a4d 100%); border-radius: 14px; padding: 3px; overflow: hidden; }
        .cert-inner { position: relative; border: 1px solid rgba(248, 211, 0, 0.35); border-radius: 12px; padding: 26px 24px 22px; color: #fff; }
        .cert-border-svg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.5; pointer-events: none; }
        .cert-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; position: relative; }
        .cert-head .label { font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold-bright); }
        .cert-head .instrument { font-family: var(--font-fraunces), serif; font-size: 19px; font-weight: 600; margin-top: 4px; }
        .cert-serial { font-family: var(--font-mono), monospace; font-size: 11px; color: rgba(255, 255, 255, 0.55); text-align: right; }

        .cert-face { text-align: center; padding: 14px 0 20px; border-bottom: 1px dashed rgba(255, 255, 255, 0.22); margin-bottom: 18px; position: relative; }
        .cert-face .fv-label { font-family: var(--font-mono), monospace; font-size: 11.5px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255, 255, 255, 0.6); margin-bottom: 6px; }
        .cert-face .fv-amount { font-family: var(--font-fraunces), serif; font-weight: 600; font-size: clamp(28px, 6vw, 38px); color: #fff; }

        .cert-rows { position: relative; display: grid; gap: 13px; }
        .cert-row { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
        .cert-row .k { font-size: 13px; color: rgba(255, 255, 255, 0.65); }
        .cert-row .v { font-family: var(--font-mono), monospace; font-size: 15.5px; font-weight: 600; color: #fff; text-align: right; }
        .cert-row.highlight .v { color: var(--gold-bright); }
        .cert-row.total { margin-top: 4px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.18); }
        .cert-row.total .k { color: #fff; font-weight: 600; font-size: 14px; }
        .cert-row.total .v { font-size: 19px; color: var(--gold-bright); }

        .cert-foot { margin-top: 20px; font-size: 11.5px; color: rgba(255, 255, 255, 0.45); font-family: var(--font-mono), monospace; text-align: center; position: relative; }

        .note { margin-top: 20px; background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 18px 20px; font-size: 13.5px; color: rgba(13, 21, 48, 0.72); }
        .note strong { color: var(--navy); }

        footer { max-width: 920px; margin: 40px auto 0; text-align: center; font-size: 12.5px; color: rgba(13, 21, 48, 0.4); font-family: var(--font-mono), monospace; }
      `}</style>
    </div>
  );
}
