"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  Home,
  Info,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

type Asset = "USDT" | "WDC";

const price = 0.01;

export default function WalletSwapPage() {
  const [from, setFrom] = useState<Asset>("USDT");
  const [amount, setAmount] = useState("");
  const [review, setReview] = useState(false);

  const to: Asset = from === "USDT" ? "WDC" : "USDT";
  const value = Number(amount || 0);

  const receive = useMemo(() => {
    if (!Number.isFinite(value) || value <= 0) return 0;
    return from === "USDT" ? value / price : value * price;
  }, [value, from]);

  function flip() {
    setFrom(to);
    setAmount("");
    setReview(false);
  }

  return (
    <main className="flow-shell">
      <div className="public-grid-bg" />

      <section className="flow-page">
        <header className="flow-topbar">
          <Link href="/wallet" className="flow-back"><ArrowLeft size={20}/> Wallet</Link>
          <div className="flow-brand"><span>W</span><strong>WADAN</strong></div>
        </header>

        <div className="flow-heading">
          <p>WALLET SWAP</p>
          <h1>Swap</h1>
          <span>Convert between USDT and WDC inside your WADAN wallet using the current reference price.</span>
        </div>

        {!review ? (
          <section className="swap-experience">
            <div className="swap-price-line">
              <div><small>Reference price</small><strong>1 WDC = $0.0100</strong></div>
              <span><RefreshCw size={16}/> Preview</span>
            </div>

            <div className="swap-box">
              <div className="swap-box-head"><span>You pay</span><small>Available: 0.00 {from}</small></div>
              <div className="swap-input-row">
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e)=>setAmount(e.target.value.replace(/[^0-9.]/g,""))}
                  placeholder="0.00"
                  aria-label="Swap amount"
                />
                <button type="button" className="swap-asset-pill">
                  {from==="USDT" ? <CircleDollarSign size={20}/> : <Coins size={20}/>}
                  {from}
                </button>
              </div>
              <div className="swap-box-foot"><span>{from==="USDT" ? "Tether USD" : "Wadan Coin"}</span><button type="button" onClick={()=>setAmount("0")}>MAX</button></div>
            </div>

            <button type="button" className="swap-flip" onClick={flip} aria-label="Reverse swap direction"><ArrowDownUp size={22}/></button>

            <div className="swap-box receive">
              <div className="swap-box-head"><span>You receive</span><small>Estimate</small></div>
              <div className="swap-input-row">
                <strong>{receive.toFixed(to==="WDC" ? 2 : 4)}</strong>
                <button type="button" className="swap-asset-pill">
                  {to==="USDT" ? <CircleDollarSign size={20}/> : <Coins size={20}/>}
                  {to}
                </button>
              </div>
              <div className="swap-box-foot"><span>{to==="USDT" ? "Tether USD" : "Wadan Coin"}</span><em>BNB Smart Chain</em></div>
            </div>

            <div className="swap-summary">
              <div><span>Rate</span><strong>1 WDC = $0.0100</strong></div>
              <div><span>Swap fee</span><strong>0.00% preview</strong></div>
              <div><span>Network</span><strong>BNB Smart Chain</strong></div>
            </div>

            <div className="flow-warning">
              <Info size={20}/>
              <p>This is a frontend preview. Live balances, admin-set pricing, limits and swap execution will be connected to the backend before launch.</p>
            </div>

            <button type="button" className="flow-primary" disabled={value <= 0} onClick={()=>setReview(true)}>
              Review swap <ArrowDownUp size={20}/>
            </button>
          </section>
        ) : (
          <section className="withdraw-review">
            <div className="review-icon"><CheckCircle2 size={34}/></div>
            <p>REVIEW SWAP</p>
            <h2>Confirm the conversion.</h2>

            <div className="review-card">
              <div><span>You pay</span><strong>{value.toFixed(4)} {from}</strong></div>
              <div><span>You receive</span><strong>{receive.toFixed(to==="WDC" ? 2 : 4)} {to}</strong></div>
              <div><span>Rate</span><strong>1 WDC = $0.0100</strong></div>
              <div><span>Network</span><strong>BNB Smart Chain</strong></div>
            </div>

            <button type="button" className="flow-primary disabled-look">Confirm swap <ShieldCheck size={20}/></button>
            <button type="button" className="flow-secondary" onClick={()=>setReview(false)}>Go back and edit</button>
          </section>
        )}

        <nav className="dash-mobile-nav gradient-border flow-mobile-nav">
          <Link href="/dashboard"><Home size={19}/><span>Home</span></Link>
          <Link className="active" href="/wallet"><WalletCards size={19}/><span>Wallet</span></Link>
          <Link href="/referrals"><Users size={19}/><span>Referral</span></Link>
          <a href="#"><Coins size={19}/><span>Stake</span></a>
          <a href="#"><UserRound size={19}/><span>Profile</span></a>
        </nav>
      </section>
    </main>
  );
}
