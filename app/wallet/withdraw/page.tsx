"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  Home,
  Info,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

type Asset = "WDC" | "USDT";
type Unit = "coin" | "usd";

const meta: Record<Asset, { name: string; price: number; network: string }> = {
  WDC: { name: "Wadan Coin", price: 0.01, network: "BNB Smart Chain • BEP-20" },
  USDT: { name: "Tether USD", price: 1, network: "BNB Smart Chain • BEP-20" },
};

export default function WithdrawPage() {
  const [asset, setAsset] = useState<Asset>("WDC");
  const [unit, setUnit] = useState<Unit>("coin");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [review, setReview] = useState(false);

  const value = Number(amount || 0);
  const selected = meta[asset];

  const converted = useMemo(() => {
    if (!Number.isFinite(value)) return 0;
    return unit === "coin" ? value * selected.price : value / selected.price;
  }, [value, unit, selected.price]);

  const coinAmount = unit === "coin" ? value : converted;
  const usdAmount = unit === "usd" ? value : converted;
  const canReview = address.trim().length >= 8 && value > 0;

  return (
    <main className="flow-shell">
      <div className="public-grid-bg" />

      <section className="flow-page">
        <header className="flow-topbar">
          <Link href="/wallet" className="flow-back"><ArrowLeft size={20}/> Wallet</Link>
          <div className="flow-brand"><span>W</span><strong>WADAN</strong></div>
        </header>

        <div className="flow-heading">
          <p>SEND FUNDS</p>
          <h1>Withdraw</h1>
          <span>Choose an asset, enter the destination and review every detail before sending.</span>
        </div>

        {!review ? (
          <section className="withdraw-form">
            <div className="flow-field-group">
              <label>Select asset</label>
              <div className="asset-selector compact" aria-label="Withdraw asset">
                {(["WDC","USDT"] as Asset[]).map((item)=>(
                  <button
                    type="button"
                    key={item}
                    className={asset===item ? "active" : ""}
                    onClick={()=>setAsset(item)}
                    aria-pressed={asset===item}
                  >
                    <span>{item==="WDC" ? <Coins size={20}/> : <CircleDollarSign size={20}/>}</span>
                    <div><strong>{item}</strong><small>{meta[item].name}</small></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="withdraw-balance-strip">
              <div><small>Available balance</small><strong>0.00 {asset}</strong></div>
              <div><small>Network</small><strong>BNB Smart Chain</strong></div>
            </div>

            <div className="flow-field-group">
              <label>Enter amount as</label>
              <div className="unit-toggle" role="group" aria-label="Amount unit">
                <button type="button" className={unit==="coin" ? "active" : ""} onClick={()=>setUnit("coin")}>{asset}</button>
                <button type="button" className={unit==="usd" ? "active" : ""} onClick={()=>setUnit("usd")}>USD</button>
              </div>
            </div>

            <div className="amount-input-card">
              <div className="amount-input-top">
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e)=>setAmount(e.target.value.replace(/[^0-9.]/g,""))}
                  placeholder="0.00"
                  aria-label="Withdrawal amount"
                />
                <span>{unit==="coin" ? asset : "USD"}</span>
              </div>
              <div className="amount-equivalent">
                <span>≈ {unit==="coin" ? "$" + usdAmount.toFixed(2) : coinAmount.toFixed(4) + " " + asset}</span>
                <button type="button" onClick={()=>setAmount("0")}>MAX</button>
              </div>
            </div>

            <div className="flow-field-group">
              <label>Destination address</label>
              <div className="destination-input">
                <input
                  value={address}
                  onChange={(e)=>setAddress(e.target.value)}
                  placeholder="0x..."
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="withdraw-summary">
              <div><span>Asset</span><strong>{asset}</strong></div>
              <div><span>Network</span><strong>{selected.network}</strong></div>
              <div><span>Estimated fee</span><strong>Calculated at confirmation</strong></div>
              <div><span>Recipient receives</span><strong>{coinAmount.toFixed(4)} {asset}</strong></div>
            </div>

            <div className="flow-warning">
              <Info size={20}/>
              <p>Withdrawal processing is still a frontend preview. Live balance checks, fees, security verification and blockchain sending will be connected to the backend later.</p>
            </div>

            <button
              type="button"
              className="flow-primary"
              disabled={!canReview}
              onClick={()=>setReview(true)}
            >
              Review withdrawal <ArrowUpRight size={20}/>
            </button>
          </section>
        ) : (
          <section className="withdraw-review">
            <div className="review-icon"><CheckCircle2 size={34}/></div>
            <p>REVIEW WITHDRAWAL</p>
            <h2>Check every detail.</h2>

            <div className="review-card">
              <div><span>Asset</span><strong>{asset}</strong></div>
              <div><span>Network</span><strong>BNB Smart Chain</strong></div>
              <div><span>Destination</span><strong className="review-address">{address}</strong></div>
              <div><span>Amount</span><strong>{coinAmount.toFixed(4)} {asset}</strong></div>
              <div><span>USD estimate</span><strong>{"$" + usdAmount.toFixed(2)}</strong></div>
              <div><span>Fee</span><strong>Pending backend quote</strong></div>
            </div>

            <button type="button" className="flow-primary disabled-look">
              Confirm withdrawal <ShieldCheck size={20}/>
            </button>
            <button type="button" className="flow-secondary" onClick={()=>setReview(false)}>Go back and edit</button>

            <div className="flow-warning">
              <Info size={20}/>
              <p>Confirmation is intentionally disabled until authentication, live balances, fees and transaction signing are connected.</p>
            </div>
          </section>
        )}

        <nav className="dash-mobile-nav gradient-border flow-mobile-nav">
          <Link href="/dashboard"><Home size={19}/><span>Home</span></Link>
          <Link className="active" href="/wallet"><WalletCards size={19}/><span>Wallet</span></Link>
          <Link href="/referrals"><Users size={19}/><span>Referral</span></Link>
          <a href="#"><ShieldCheck size={19}/><span>Stake</span></a>
          <Link href="/account"><UserRound size={19}/><span>Profile</span></Link>
        </nav>
      </section>
    </main>
  );
}
