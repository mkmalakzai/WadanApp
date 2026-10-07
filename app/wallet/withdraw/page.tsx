"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  History,
  Info,
  ShieldCheck,
} from "lucide-react";
import MobileDock from "../../components/MobileDock";
import { fetchCached, readCached, invalidateCached } from "../../../lib/client-cache";

type Asset = "WDC" | "USDT";
type Unit = "coin" | "usd";

type Summary = {
  profile: { wdcBalance:number; usdtBalance:number; };
  wdcPrice:number;
  flags:{ withdrawals:boolean };
};

export default function WithdrawPage() {
  const [summary,setSummary]=useState<Summary | null>(()=>readCached<Summary>("wallet:summary"));
  const [asset,setAsset]=useState<Asset>("WDC");
  const [unit,setUnit]=useState<Unit>("coin");
  const [amount,setAmount]=useState("");
  const [address,setAddress]=useState("");
  const [review,setReview]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{
    void fetchCached<Summary>("wallet:summary","/api/wallet/summary")
      .then(setSummary)
      .catch((err)=>setError(err instanceof Error ? err.message : "Unable to load wallet."));
  },[]);

  const price=asset==="WDC" ? summary?.wdcPrice ?? 0.01 : 1;
  const balance=asset==="WDC" ? summary?.profile.wdcBalance ?? 0 : summary?.profile.usdtBalance ?? 0;
  const value=Number(amount || 0);

  const converted=useMemo(()=>{
    if(!Number.isFinite(value)) return 0;
    return unit==="coin" ? value*price : value/price;
  },[value,unit,price]);

  const coinAmount=unit==="coin" ? value : converted;
  const usdAmount=unit==="usd" ? value : converted;
  const canReview=/^0x[a-fA-F0-9]{40}$/.test(address.trim()) && coinAmount>0 && coinAmount<=balance;

  async function confirmWithdrawal(){
    setSubmitting(true);
    setMessage("");
    setError("");

    try{
      const response=await fetch("/api/wallet/withdraw",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({asset,amount:coinAmount,address:address.trim()}),
      });
      const data=await response.json();

      if(!response.ok) throw new Error(data.error || "Unable to request withdrawal.");

      invalidateCached("wallet:summary","history");
      void fetchCached<Summary>("wallet:summary","/api/wallet/summary",{force:true}).then(setSummary).catch(()=>undefined);
      setMessage("Withdrawal request created and balance reserved for review.");
      setReview(false);
      setAmount("");
      setAddress("");
    }catch(err){
      setError(err instanceof Error ? err.message : "Unable to request withdrawal.");
    }finally{
      setSubmitting(false);
    }
  }

  function max(){
    setUnit("coin");
    setAmount(String(balance));
  }

  const enabled=Boolean(summary?.flags.withdrawals);

  return (
    <main className="flow-shell feature-withdraw">
      <div className="public-grid-bg" />

      <section className="flow-page">
        <header className="flow-topbar">
          <Link href="/wallet" className="flow-back"><ArrowLeft size={20}/> Wallet</Link>
          <div className="flow-brand"><span>W</span><strong>WADAN</strong></div>
        </header>

        <div className="flow-heading">
          <p>SEND FUNDS</p>
          <h1>Withdraw</h1>
          <span>Create a withdrawal request on BNB Smart Chain. Funds are reserved while the request is reviewed.</span>
        </div>


        {summary && !enabled && (
          <div className="flow-warning">
            <Info size={20}/>
            <p><strong>Withdrawals are currently disabled.</strong> Withdrawals are temporarily unavailable.</p>
          </div>
        )}

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
                    onClick={()=>{setAsset(item);setAmount("");}}
                    aria-pressed={asset===item}
                  >
                    <span>{item==="WDC" ? <Coins size={20}/> : <CircleDollarSign size={20}/>}</span>
                    <div><strong>{item}</strong><small>{item==="WDC" ? "Wadan Coin" : "Tether USD"}</small></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="withdraw-balance-strip">
              <div><small>Available balance</small><strong>{balance.toLocaleString("en-US",{maximumFractionDigits:6})} {asset}</strong></div>
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
                <span>≈ {unit==="coin" ? "$"+usdAmount.toFixed(2) : coinAmount.toFixed(4)+" "+asset}</span>
                <button type="button" onClick={max}>MAX</button>
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
              <div><span>Network</span><strong>BNB Smart Chain • BEP-20</strong></div>
              <div><span>Amount</span><strong>{coinAmount.toFixed(4)} {asset}</strong></div>
              <div><span>USD estimate</span><strong>{"$"+usdAmount.toFixed(2)}</strong></div>
            </div>

            {error && <div className="auth-live-message error">{error}</div>}
            {message && <div className="auth-live-message success">{message}</div>}

            <button
              type="button"
              className="flow-primary"
              disabled={!enabled || !canReview}
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
              <div><span>USD estimate</span><strong>{"$"+usdAmount.toFixed(2)}</strong></div>
              <div><span>Status after submit</span><strong>Pending review</strong></div>
            </div>

            {error && <div className="auth-live-message error">{error}</div>}
            {message && <div className="auth-live-message success">{message}</div>}

            <button type="button" className="flow-primary" disabled={submitting} onClick={confirmWithdrawal}>
              {submitting ? "Submitting..." : "Confirm withdrawal"} <ShieldCheck size={20}/>
            </button>
            <button type="button" className="flow-secondary" onClick={()=>setReview(false)}>Go back and edit</button>
          </section>
        )}

        <Link href="/history/withdraw" className="feature-history-bottom"><History size={16}/> Withdrawal history</Link>
        <MobileDock active="/wallet" />
      </section>
    </main>
  );
}
