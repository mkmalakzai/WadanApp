"use client";

import Link from "next/link";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  History,
  Info,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import MobileDock from "../../components/MobileDock";
import { fetchCached, readCached, invalidateCached } from "../../../lib/client-cache";

type Asset = "WDC" | "USDT";

type DepositConfig = {
  enabled: boolean;
  address: string;
  network: string;
};

const names: Record<Asset,string> = {
  WDC: "Wadan Coin",
  USDT: "Tether USD",
};

export default function DepositPage() {
  const [asset,setAsset]=useState<Asset>("WDC");
  const [config,setConfig]=useState<DepositConfig | null>(()=>readCached<DepositConfig>("wallet:deposit"));
  const [copied,setCopied]=useState(false);
  const [amount,setAmount]=useState("");
  const [txHash,setTxHash]=useState("");
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [submitting,setSubmitting]=useState(false);

  useEffect(()=>{
    void fetchCached<DepositConfig>("wallet:deposit","/api/wallet/deposit")
      .then(setConfig)
      .catch((err)=>setError(err instanceof Error ? err.message : "Unable to load deposit settings."));
  },[]);

  async function copyAddress(){
    if(!config?.address) return;
    try{
      await navigator.clipboard.writeText(config.address);
      setCopied(true);
      window.setTimeout(()=>setCopied(false),1800);
    }catch{
      setCopied(false);
    }
  }

  async function submit(){
    setMessage("");
    setError("");
    setSubmitting(true);

    try{
      const response=await fetch("/api/wallet/deposit",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          asset,
          amount:Number(amount),
          txHash:txHash.trim(),
        }),
      });
      const data=await response.json();

      if(!response.ok) throw new Error(data.error || "Unable to submit deposit.");

      invalidateCached("wallet:summary","history");
      setMessage("Deposit submitted for review. Your balance will update after confirmation.");
      setAmount("");
      setTxHash("");
    }catch(err){
      setError(err instanceof Error ? err.message : "Unable to submit deposit.");
    }finally{
      setSubmitting(false);
    }
  }

  const ready=Boolean(config?.enabled && config?.address);

  return (
    <main className="flow-shell feature-deposit">
      <div className="public-grid-bg" />

      <section className="flow-page">
        <header className="flow-topbar">
          <Link href="/wallet" className="flow-back"><ArrowLeft size={20}/> Wallet</Link>
          <div className="flow-brand"><span>W</span><strong>WADAN</strong></div>
        </header>

        <div className="flow-heading">
          <p>RECEIVE FUNDS</p>
          <h1>Deposit</h1>
          <span>Send funds on BNB Smart Chain, then submit the transaction hash for confirmation.</span>
        </div>


        <section className="asset-selector" aria-label="Deposit asset">
          {(["WDC","USDT"] as Asset[]).map((item)=>(
            <button
              type="button"
              key={item}
              className={asset===item ? "active" : ""}
              onClick={()=>setAsset(item)}
              aria-pressed={asset===item}
            >
              <span>{item==="WDC" ? "W" : "$"}</span>
              <div><strong>{item}</strong><small>{names[item]}</small></div>
            </button>
          ))}
        </section>

        <section className="deposit-experience">
          <div className="deposit-network">
            <div>
              <small>Selected network</small>
              <strong>{config?.network || "BNB Smart Chain • BEP-20"}</strong>
            </div>
            <ShieldCheck size={22}/>
          </div>

          {!config && !error ? (
            <div className="flow-loading-card">
              <span className="flow-loading-pulse" />
              <div><strong>Preparing deposit details</strong><p>Checking your wallet settings…</p></div>
            </div>
          ) : !ready ? (
            <div className="flow-warning">
              <Info size={20}/>
              <p><strong>Deposits are unavailable right now.</strong> Please try again shortly.</p>
            </div>
          ) : (
            <>
              <div className="qr-stage">
                <div className="qr-frame">
                  <QRCode
                    value={config?.address || ""}
                    size={256}
                    viewBox="0 0 256 256"
                    bgColor="#FFFFFF"
                    fgColor="#090D13"
                    level="M"
                    title={asset+" deposit address on BNB Smart Chain"}
                    style={{width:"100%",height:"auto"}}
                  />
                </div>
                <div className="qr-caption"><QrCode size={18}/><span>Scan with your sending wallet</span></div>
              </div>

              <div className="full-address-card">
                <small>{asset} deposit address</small>
                <code>{config?.address}</code>
                <button type="button" onClick={copyAddress}>
                  {copied ? <Check size={20}/> : <Copy size={20}/>}
                  {copied ? "Address copied" : "Copy full address"}
                </button>
              </div>

              <div className="withdraw-form">
                <div className="flow-field-group">
                  <label>Amount sent</label>
                  <div className="destination-input">
                    <input
                      inputMode="decimal"
                      value={amount}
                      onChange={(e)=>setAmount(e.target.value.replace(/[^0-9.]/g,""))}
                      placeholder={"0.00 "+asset}
                    />
                  </div>
                </div>

                <div className="flow-field-group">
                  <label>Transaction hash</label>
                  <div className="destination-input">
                    <input
                      value={txHash}
                      onChange={(e)=>setTxHash(e.target.value.trim())}
                      placeholder="0x..."
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>
                </div>

                {error && <div className="auth-live-message error">{error}</div>}
                {message && <div className="auth-live-message success">{message}</div>}

                <button
                  type="button"
                  className="flow-primary"
                  disabled={submitting || Number(amount)<=0 || !/^0x[a-fA-F0-9]{64}$/.test(txHash)}
                  onClick={submit}
                >
                  {submitting ? "Submitting..." : "Submit deposit for confirmation"}
                </button>
              </div>
            </>
          )}
        </section>

        <section className="flow-instructions">
          <div className="flow-section-title">
            <span>HOW TO DEPOSIT</span>
            <strong>Follow these steps</strong>
          </div>
          <ol>
            <li><span>1</span><div><strong>Select {asset}</strong><p>Choose the same asset in the wallet or exchange you are sending from.</p></div></li>
            <li><span>2</span><div><strong>Use BNB Smart Chain</strong><p>The transfer must use BEP-20.</p></div></li>
            <li><span>3</span><div><strong>Send to the shown address</strong><p>Double-check the address before sending.</p></div></li>
            <li><span>4</span><div><strong>Submit the transaction hash</strong><p>Your WADAN balance updates after the transfer is confirmed.</p></div></li>
          </ol>
        </section>

        <Link href="/history/deposit" className="feature-history-bottom"><History size={16}/> Deposit history</Link>
        <MobileDock active="/wallet" />
      </section>
    </main>
  );
}
