"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  Info,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import MobileDock from "../../components/MobileDock";
import { fetchCached, readCached, invalidateCached } from "../../../lib/client-cache";

type Asset = "USDT" | "WDC";

type Summary = {
  profile: { wdcBalance:number; usdtBalance:number; };
  wdcPrice:number;
  flags:{ swaps:boolean };
};

export default function WalletSwapPage() {
  const [summary,setSummary]=useState<Summary | null>(()=>readCached<Summary>("wallet:summary"));
  const [from,setFrom]=useState<Asset>("USDT");
  const [amount,setAmount]=useState("");
  const [review,setReview]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{
    void fetchCached<Summary>("wallet:summary","/api/wallet/summary")
      .then(setSummary)
      .catch((err)=>setError(err instanceof Error ? err.message : "Unable to load wallet."));
  },[]);

  const to:Asset=from==="USDT" ? "WDC" : "USDT";
  const value=Number(amount || 0);
  const price=summary?.wdcPrice ?? 0.01;
  const available=from==="USDT" ? summary?.profile.usdtBalance ?? 0 : summary?.profile.wdcBalance ?? 0;

  const receive=useMemo(()=>{
    if(!Number.isFinite(value) || value<=0) return 0;
    return from==="USDT" ? value/price : value*price;
  },[value,from,price]);

  function flip(){
    setFrom(to);
    setAmount("");
    setReview(false);
    setMessage("");
    setError("");
  }

  function max(){
    setAmount(String(available));
  }

  async function confirmSwap(){
    setSubmitting(true);
    setMessage("");
    setError("");

    try{
      const response=await fetch("/api/wallet/swap",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({fromAsset:from,amount:value}),
      });
      const data=await response.json();

      if(!response.ok) throw new Error(data.error || "Unable to execute swap.");

      setMessage("Swap completed and both wallet balances were updated.");
      setReview(false);
      setAmount("");

      invalidateCached("wallet:summary","history");
      void fetchCached<Summary>("wallet:summary","/api/wallet/summary",{force:true})
        .then(setSummary)
        .catch(()=>undefined);
    }catch(err){
      setError(err instanceof Error ? err.message : "Unable to execute swap.");
    }finally{
      setSubmitting(false);
    }
  }

  const enabled=Boolean(summary?.flags.swaps);
  const canReview=enabled && value>0 && value<=available;

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
          <span>Convert between USDT and WDC inside your WADAN wallet using the current WDC reference price.</span>
        </div>

        {summary && !enabled && (
          <div className="flow-warning">
            <Info size={20}/>
            <p><strong>Swaps are currently disabled.</strong> Swaps are temporarily unavailable.</p>
          </div>
        )}

        {!review ? (
          <section className="swap-experience">
            <div className="swap-price-line">
              <div><small>Reference price</small><strong>1 WDC = {price.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:4,maximumFractionDigits:4})}</strong></div>
              <span><RefreshCw size={16}/> Current rate</span>
            </div>

            <div className="swap-box">
              <div className="swap-box-head"><span>You pay</span><small>Available: {available.toLocaleString("en-US",{maximumFractionDigits:6})} {from}</small></div>
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
              <div className="swap-box-foot"><span>{from==="USDT" ? "Tether USD" : "Wadan Coin"}</span><button type="button" onClick={max}>MAX</button></div>
            </div>

            <button type="button" className="swap-flip" onClick={flip} aria-label="Reverse swap direction"><ArrowDownUp size={22}/></button>

            <div className="swap-box receive">
              <div className="swap-box-head"><span>You receive</span><small>Estimated amount</small></div>
              <div className="swap-input-row">
                <strong>{receive.toFixed(to==="WDC" ? 2 : 4)}</strong>
                <button type="button" className="swap-asset-pill">
                  {to==="USDT" ? <CircleDollarSign size={20}/> : <Coins size={20}/>}
                  {to}
                </button>
              </div>
              <div className="swap-box-foot"><span>{to==="USDT" ? "Tether USD" : "Wadan Coin"}</span><em>Internal wallet conversion</em></div>
            </div>

            <div className="swap-summary">
              <div><span>Rate</span><strong>1 WDC = {price.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:4,maximumFractionDigits:4})}</strong></div>
              <div><span>Swap fee</span><strong>0.00%</strong></div>
              <div><span>Settlement</span><strong>Instant internal ledger</strong></div>
            </div>

            {error && <div className="auth-live-message error">{error}</div>}
            {message && <div className="auth-live-message success">{message}</div>}

            <button type="button" className="flow-primary" disabled={!canReview} onClick={()=>setReview(true)}>
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
              <div><span>Rate</span><strong>1 WDC = {price.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:4,maximumFractionDigits:4})}</strong></div>
              <div><span>Settlement</span><strong>Instant wallet conversion</strong></div>
            </div>

            {error && <div className="auth-live-message error">{error}</div>}

            <button type="button" className="flow-primary" disabled={submitting} onClick={confirmSwap}>
              {submitting ? "Swapping..." : "Confirm swap"} <ShieldCheck size={20}/>
            </button>
            <button type="button" className="flow-secondary" onClick={()=>setReview(false)}>Go back and edit</button>
          </section>
        )}

        <MobileDock active="/wallet" />
      </section>
    </main>
  );
}
