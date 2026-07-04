"use client";

import { useMemo, useState } from "react";

type FieldGroup = { title: string; ids: string[] };
type CustomField = { id: string; name: string; value: string };

const ASSET_LABELS: Record<string, string> = {
  cash: "Cash on hand",
  nairaSavings: "Naira savings account",
  domSavings: "Domiciliary / foreign account",
  fixedDeposit: "Fixed / term deposit",
  mmf: "Money market fund",
  tbills: "Treasury Bills / bonds",
  equity: "Equity / mutual funds",
  ngxStocks: "NGX-listed stocks",
  foreignStocks: "Foreign stocks / ETFs",
  crypto: "Crypto assets",
  pension: "Pension (RSA / 401k / private)",
  primaryResidence: "Primary residence",
  otherProperty: "Other property / land",
  business: "Business ownership (est. value)",
  vehicles: "Vehicle(s), current value",
};

const ASSET_GROUPS: FieldGroup[] = [
  { title: "Cash & Savings", ids: ["cash", "nairaSavings", "domSavings", "fixedDeposit"] },
  { title: "Investments", ids: ["mmf", "tbills", "equity", "ngxStocks", "foreignStocks", "crypto", "pension"] },
  { title: "Property & Business", ids: ["primaryResidence", "otherProperty", "business", "vehicles"] },
];

const LIAB_LABELS: Record<string, string> = {
  creditCard: "Credit card balance",
  bnpl: "Buy-now-pay-later balance",
  overdraft: "Overdraft",
  personalLoan: "Personal / salary loan",
  studentLoan: "Student loan",
  carLoan: "Car loan",
  mortgage: "Mortgage / home loan balance",
  businessLoan: "Business loan",
  cooperative: "Cooperative / thrift (Ajo/Esusu) owed",
  familyLoan: "Family / friend borrowing",
  taxOwed: "Outstanding tax owed",
};

const LIAB_GROUPS: FieldGroup[] = [
  { title: "Everyday Debt", ids: ["creditCard", "bnpl", "overdraft"] },
  { title: "Loans", ids: ["personalLoan", "studentLoan", "carLoan", "mortgage", "businessLoan"] },
  { title: "Obligations", ids: ["cooperative", "familyLoan", "taxOwed"] },
];

const CURRENCIES: { code: string; label: string; symbol: string }[] = [
  { code: "NGN", label: "₦ Nigerian Naira", symbol: "₦" },
  { code: "USD", label: "$ US Dollar", symbol: "$" },
  { code: "GBP", label: "£ British Pound", symbol: "£" },
  { code: "EUR", label: "€ Euro", symbol: "€" },
  { code: "CAD", label: "C$ Canadian Dollar", symbol: "C$" },
  { code: "AUD", label: "A$ Australian Dollar", symbol: "A$" },
  { code: "GHS", label: "GH₵ Ghanaian Cedi", symbol: "GH₵" },
  { code: "ZAR", label: "R South African Rand", symbol: "R" },
  { code: "KES", label: "KSh Kenyan Shilling", symbol: "KSh" },
  { code: "XOF", label: "CFA West African Franc", symbol: "CFA" },
  { code: "AED", label: "د.إ UAE Dirham", symbol: "د.إ" },
  { code: "CHF", label: "CHF Swiss Franc", symbol: "CHF" },
  { code: "JPY", label: "¥ Japanese Yen", symbol: "¥" },
  { code: "CNY", label: "¥ Chinese Yuan", symbol: "¥" },
  { code: "INR", label: "₹ Indian Rupee", symbol: "₹" },
  { code: "SEK", label: "kr Swedish Krona", symbol: "kr" },
  { code: "NOK", label: "kr Norwegian Krone", symbol: "kr" },
  { code: "SAR", label: "﷼ Saudi Riyal", symbol: "﷼" },
  { code: "QAR", label: "﷼ Qatari Riyal", symbol: "﷼" },
  { code: "SGD", label: "S$ Singapore Dollar", symbol: "S$" },
  { code: "NZD", label: "NZ$ New Zealand Dollar", symbol: "NZ$" },
  { code: "EGP", label: "E£ Egyptian Pound", symbol: "E£" },
];

function formatNumber(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return sign + abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function sumValues(values: Record<string, string>) {
  return Object.values(values).reduce((total, raw) => {
    const val = parseFloat(raw);
    return isNaN(val) ? total : total + val;
  }, 0);
}

function sumCustom(rows: CustomField[]) {
  return rows.reduce((total, row) => {
    const val = parseFloat(row.value);
    return isNaN(val) ? total : total + val;
  }, 0);
}

export default function NetWorthCalculator() {
  const [currency, setCurrency] = useState("NGN");
  const [assetValues, setAssetValues] = useState<Record<string, string>>({});
  const [liabValues, setLiabValues] = useState<Record<string, string>>({});
  const [customAssets, setCustomAssets] = useState<CustomField[]>([]);
  const [customLiabs, setCustomLiabs] = useState<CustomField[]>([]);
  const [newAssetName, setNewAssetName] = useState("");
  const [newLiabName, setNewLiabName] = useState("");

  const sym = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₦";

  const totalAssets = useMemo(
    () => sumValues(assetValues) + sumCustom(customAssets),
    [assetValues, customAssets]
  );
  const totalLiab = useMemo(
    () => sumValues(liabValues) + sumCustom(customLiabs),
    [liabValues, customLiabs]
  );
  const net = totalAssets - totalLiab;

  let subMessage = "Fill in your figures below, this updates as you type.";
  if (totalAssets !== 0 || totalLiab !== 0) {
    if (net < 0) {
      subMessage = "Your liabilities currently outweigh your assets. That's a starting point, not a sentence. Every wealth journey has one.";
    } else if (net === 0) {
      subMessage = "You're at breakeven. The next Naira you save moves you into positive net worth.";
    } else {
      subMessage = "This is your true financial position today: the baseline every goal in your plan should be measured against.";
    }
  }

  function addCustomAsset() {
    const name = newAssetName.trim();
    if (!name) return;
    setCustomAssets((prev) => [...prev, { id: `a-${Date.now()}-${Math.random()}`, name, value: "" }]);
    setNewAssetName("");
  }

  function addCustomLiab() {
    const name = newLiabName.trim();
    if (!name) return;
    setCustomLiabs((prev) => [...prev, { id: `l-${Date.now()}-${Math.random()}`, name, value: "" }]);
    setNewLiabName("");
  }

  function resetAll() {
    setAssetValues({});
    setLiabValues({});
    setCustomAssets([]);
    setCustomLiabs([]);
    setNewAssetName("");
    setNewLiabName("");
  }

  return (
    <div className="nw-calc">
      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">Finance with Anne</span>
          <h1>Know your number before you plan the <em>next ten years.</em></h1>
          <p className="lede">Your net worth is the single honest snapshot of where you stand today: everything you own, minus everything you owe. Add every account, property, and debt below, whether it sits in Lagos or London, and watch your true position take shape in real time.</p>
          <div className="tagline-strip">
            <span>Built for Nigerians at home and abroad</span>
            <span>20+ currencies supported</span>
          </div>
        </div>
      </section>

      <div className="explain">
        <div className="explain-card">
          <div className="explain-step">
            <span className="num">01</span>
            <h3>List what you own</h3>
            <p>Cash, investments, property, business interests, anywhere in the world. Leave any field blank if it doesn't apply to you.</p>
          </div>
          <div className="explain-step">
            <span className="num">02</span>
            <h3>List what you owe</h3>
            <p>Loans, mortgages, credit cards, family obligations. Debt isn't a verdict. It's simply one half of the equation.</p>
          </div>
          <div className="explain-step">
            <span className="num">03</span>
            <h3>See your net worth</h3>
            <p>Assets minus liabilities, updating instantly. This is your starting line for every goal in the Three-Layer Wealth Stack.</p>
          </div>
        </div>
      </div>

      <section className="calc-section">
        <div className="calc-header">
          <h2>The Net Worth Ledger</h2>
          <div className="currency-picker">
            <label htmlFor="currency">Display in</label>
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="result-band">
          <div>
            <div className="result-label">Your net worth</div>
            <div className={`result-figure${net < 0 ? " negative" : ""}`}>{sym}{formatNumber(net)}</div>
            <div className="result-sub">{subMessage}</div>
          </div>
          <div className="result-breakdown">
            <div>
              <div className="k">Total assets</div>
              <div className="v assets-v">{sym}{formatNumber(totalAssets)}</div>
            </div>
            <div>
              <div className="k">Total liabilities</div>
              <div className="v liab-v">{sym}{formatNumber(totalLiab)}</div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* ASSETS */}
          <div className="panel assets-panel">
            <div className="panel-head">
              <span className="dot" />
              <h3>Assets, what you own</h3>
            </div>

            {ASSET_GROUPS.map((group) => (
              <div className="group" key={group.title}>
                <div className="group-title">{group.title}</div>
                {group.ids.map((id) => (
                  <div className="row" key={id}>
                    <label>{ASSET_LABELS[id]}</label>
                    <div className="field">
                      <span className="cur">{sym}</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={assetValues[id] ?? ""}
                        onChange={(e) => setAssetValues((prev) => ({ ...prev, [id]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="group">
              <div className="group-title">Other</div>
              {customAssets.map((row) => (
                <div className="row" key={row.id}>
                  <label>{row.name}</label>
                  <div className="field">
                    <span className="cur">{sym}</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={row.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomAssets((prev) => prev.map((r) => (r.id === row.id ? { ...r, value: val } : r)));
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="panel-footer">
              <div className="custom-add">
                <input
                  type="text"
                  placeholder="Add another asset (e.g. inheritance, jewelry)"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addCustomAsset(); }
                  }}
                />
                <button type="button" onClick={addCustomAsset}>Add</button>
              </div>
            </div>

            <div className="panel-total">
              <span className="lbl">Total assets</span>
              <span className="amt">{sym}{formatNumber(totalAssets)}</span>
            </div>
          </div>

          {/* LIABILITIES */}
          <div className="panel liab-panel">
            <div className="panel-head">
              <span className="dot" />
              <h3>Liabilities, what you owe</h3>
            </div>

            {LIAB_GROUPS.map((group) => (
              <div className="group" key={group.title}>
                <div className="group-title">{group.title}</div>
                {group.ids.map((id) => (
                  <div className="row" key={id}>
                    <label>{LIAB_LABELS[id]}</label>
                    <div className="field">
                      <span className="cur">{sym}</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={liabValues[id] ?? ""}
                        onChange={(e) => setLiabValues((prev) => ({ ...prev, [id]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="group">
              <div className="group-title">Other</div>
              {customLiabs.map((row) => (
                <div className="row" key={row.id}>
                  <label>{row.name}</label>
                  <div className="field">
                    <span className="cur">{sym}</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={row.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomLiabs((prev) => prev.map((r) => (r.id === row.id ? { ...r, value: val } : r)));
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="panel-footer">
              <div className="custom-add">
                <input
                  type="text"
                  placeholder="Add another liability (e.g. medical debt)"
                  value={newLiabName}
                  onChange={(e) => setNewLiabName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addCustomLiab(); }
                  }}
                />
                <button type="button" onClick={addCustomLiab}>Add</button>
              </div>
            </div>

            <div className="panel-total">
              <span className="lbl">Total liabilities</span>
              <span className="amt">{sym}{formatNumber(totalLiab)}</span>
            </div>
          </div>
        </div>

        <div className="reset-row">
          <button type="button" onClick={resetAll}>Clear everything and start again</button>
        </div>
      </section>

      <footer className="nw-footer">
        This tool gives you a snapshot, not financial advice. For a plan built around your number, book a session with <strong>Coach Anne</strong> at Finance with Anne.
      </footer>

      <style jsx>{`
        .nw-calc {
          --periwinkle: #7596f7;
          --royal: #0040cf;
          --navy: #02133b;
          --gold: #cfb000;
          --yellow: #f8d300;
          --paper: #f6f5ef;
          --ink: #02133b;
          --line: rgba(2, 19, 59, 0.12);
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-inter), sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        @media (prefers-reduced-motion: reduce) {
          .nw-calc, .nw-calc * { animation: none !important; transition: none !important; }
        }

        .nw-calc h1, .nw-calc h2, .nw-calc h3, .nw-calc .serif { font-family: var(--font-fraunces), serif; }

        /* HERO */
        .hero {
          background: var(--navy);
          color: #fff;
          padding: 64px 24px 88px;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: "";
          position: absolute;
          top: -40%; right: -15%;
          width: 60%; height: 180%;
          background: radial-gradient(circle, rgba(117,150,247,0.35) 0%, rgba(117,150,247,0) 70%);
          pointer-events: none;
        }
        .hero::after {
          content: "";
          position: absolute;
          bottom: -50%; left: -10%;
          width: 50%; height: 150%;
          background: radial-gradient(circle, rgba(207,176,0,0.18) 0%, rgba(207,176,0,0) 70%);
          pointer-events: none;
        }
        .hero-inner { max-width: 920px; margin: 0 auto; position: relative; z-index: 1; }
        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12.5px; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--yellow); font-weight: 700; margin-bottom: 22px;
        }
        .eyebrow::before { content: ""; width: 7px; height: 7px; background: var(--yellow); border-radius: 50%; display: inline-block; }
        .hero h1 { font-size: clamp(34px, 5.4vw, 58px); line-height: 1.05; font-weight: 600; margin: 0 0 20px; max-width: 14ch; }
        .hero h1 em { font-style: italic; font-weight: 500; color: var(--periwinkle); }
        .hero p.lede { font-size: clamp(16px, 2vw, 19px); line-height: 1.6; color: rgba(255,255,255,0.82); max-width: 56ch; margin: 0 0 28px; }
        .tagline-strip {
          display: flex; flex-wrap: wrap; gap: 10px 28px; font-size: 13.5px; color: rgba(255,255,255,0.65);
          border-top: 1px solid rgba(255,255,255,0.16); padding-top: 20px; margin-top: 8px;
        }

        /* HOW IT WORKS */
        .explain { max-width: 920px; margin: -48px auto 0; position: relative; z-index: 2; padding: 0 24px; }
        .explain-card {
          background: #fff; border-radius: 18px; box-shadow: 0 24px 60px -20px rgba(2,19,59,0.35);
          padding: 36px 32px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
        }
        @media (max-width: 720px) { .explain-card { grid-template-columns: 1fr; padding: 28px 22px; } }
        .explain-step { position: relative; }
        .explain-step .num { font-family: var(--font-fraunces), serif; font-size: 15px; font-weight: 600; color: var(--royal); margin-bottom: 8px; display: block; }
        .explain-step h3 { font-size: 16.5px; margin: 0 0 6px; font-weight: 600; }
        .explain-step p { font-size: 14px; line-height: 1.55; color: #3d4a63; margin: 0; }
        .explain-step + .explain-step { border-left: 1px solid var(--line); padding-left: 28px; }
        @media (max-width: 720px) {
          .explain-step + .explain-step { border-left: none; padding-left: 0; border-top: 1px solid var(--line); padding-top: 22px; }
        }

        /* CALCULATOR SHELL */
        .calc-section { max-width: 1080px; margin: 56px auto 0; padding: 0 24px 80px; }
        .calc-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; margin-bottom: 22px; }
        .calc-header h2 { font-size: clamp(24px, 3vw, 30px); margin: 0; font-weight: 600; }
        .currency-picker { display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid var(--line); border-radius: 999px; padding: 6px 8px 6px 16px; }
        .currency-picker label { font-size: 12.5px; font-weight: 600; color: #4a5674; letter-spacing: 0.02em; }
        .currency-picker select {
          border: none; background: var(--navy); color: #fff; font-family: var(--font-inter), sans-serif; font-weight: 600;
          font-size: 14px; padding: 8px 14px; border-radius: 999px; cursor: pointer; appearance: none; -webkit-appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; background-size: 14px; padding-right: 34px;
        }
        .currency-picker select:focus-visible { outline: 2px solid var(--periwinkle); outline-offset: 2px; }

        .result-band {
          background: var(--navy); border-radius: 20px; padding: 30px 32px; color: #fff;
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;
          margin-bottom: 32px; position: sticky; top: 104px; z-index: 30; overflow: hidden;
          box-shadow: 0 20px 45px -18px rgba(2,19,59,0.55);
        }
        @media (max-width: 720px) {
          .result-band { padding: 20px 20px; top: 100px; border-radius: 16px; gap: 14px; }
          .result-breakdown { gap: 18px; }
        }
        .result-band::before {
          content: ""; position: absolute; top: -60%; right: -8%; width: 40%; height: 220%;
          background: radial-gradient(circle, rgba(248,211,0,0.14) 0%, rgba(248,211,0,0) 70%);
        }
        .result-label { font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.14em; color: rgba(255,255,255,0.6); font-weight: 700; margin-bottom: 8px; position: relative; z-index: 1; }
        .result-figure {
          font-family: var(--font-fraunces), serif; font-size: clamp(32px, 5.5vw, 52px); font-weight: 600; color: var(--yellow);
          line-height: 1; position: relative; z-index: 1; font-variant-numeric: tabular-nums; transition: color 0.3s ease;
        }
        .result-figure.negative { color: var(--periwinkle); }
        .result-sub { font-size: 13.5px; color: rgba(255,255,255,0.7); max-width: 32ch; line-height: 1.5; position: relative; z-index: 1; }
        .result-breakdown { display: flex; gap: 28px; position: relative; z-index: 1; }
        .result-breakdown div { text-align: right; }
        .result-breakdown .k { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.55); margin-bottom: 4px; }
        .result-breakdown .v { font-family: var(--font-fraunces), serif; font-size: 19px; font-weight: 600; font-variant-numeric: tabular-nums; }
        .v.assets-v { color: var(--periwinkle); }
        .v.liab-v { color: #ff9d9d; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 800px) { .grid-2 { grid-template-columns: 1fr; } }

        .panel { background: #fff; border-radius: 18px; border: 1px solid var(--line); overflow: hidden; }
        .panel-head { padding: 20px 24px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--line); }
        .panel-head .dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
        .assets-panel .panel-head .dot { background: var(--royal); }
        .liab-panel .panel-head .dot { background: var(--gold); }
        .panel-head h3 { margin: 0; font-size: 17px; font-weight: 600; }

        .group { padding: 18px 24px 4px; }
        .group-title {
          font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; color: #8a92a8;
          margin: 10px 0 12px; display: flex; align-items: center; gap: 8px;
        }
        .group-title::after { content: ""; flex: 1; height: 1px; background: var(--line); }

        .row { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 9px 0; }
        .row label { font-size: 14px; color: #26304a; flex: 1; min-width: 0; }
        .row .field { position: relative; width: 150px; flex-shrink: 0; }
        .row .field .cur { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; color: #8a92a8; font-weight: 600; pointer-events: none; }
        .row input {
          width: 100%; border: 1px solid var(--line); border-radius: 9px; padding: 9px 10px 9px 34px; font-size: 14px;
          font-family: var(--font-inter), sans-serif; text-align: right; color: var(--ink); background: #fbfbf8; font-variant-numeric: tabular-nums;
        }
        .row input:focus-visible { outline: 2px solid var(--periwinkle); outline-offset: 1px; background: #fff; }
        .row input::placeholder { color: #c2c8d6; }

        .panel-footer { padding: 18px 24px 22px; }
        .custom-add { display: flex; gap: 8px; margin-top: 6px; }
        .custom-add input[type="text"] {
          flex: 1; border: 1px dashed var(--line); border-radius: 9px; padding: 9px 12px; font-size: 13.5px;
          font-family: var(--font-inter), sans-serif; background: transparent;
        }
        .custom-add button {
          border: 1px solid var(--line); background: var(--paper); color: var(--navy); font-weight: 600; font-size: 13px;
          padding: 9px 16px; border-radius: 9px; cursor: pointer; white-space: nowrap;
        }
        .custom-add button:hover { background: #eceae0; }

        .panel-total { display: flex; justify-content: space-between; align-items: baseline; padding: 16px 24px; background: var(--paper); border-top: 1px solid var(--line); }
        .panel-total .lbl { font-size: 13px; font-weight: 600; color: #4a5674; }
        .panel-total .amt { font-family: var(--font-fraunces), serif; font-size: 22px; font-weight: 600; font-variant-numeric: tabular-nums; }
        .assets-panel .panel-total .amt { color: var(--royal); }
        .liab-panel .panel-total .amt { color: #a67c00; }

        .reset-row { text-align: center; margin-top: 28px; }
        .reset-row button { background: none; border: none; color: #7a8299; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
        .reset-row button:hover { color: var(--navy); }

        .nw-footer { text-align: center; padding: 40px 24px 56px; color: #8a92a8; font-size: 13px; }
        .nw-footer strong { color: var(--navy); }
      `}</style>
    </div>
  );
}
