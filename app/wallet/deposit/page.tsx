"use client";

import Link from "next/link";
import QRCode from "react-qr-code";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Home,
  Info,
  QrCode,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import MobileDock from "../../components/MobileDock";

type Asset = "WDC" | "USDT";

const depositData: Record<Asset, { name: string; network: string; address: string }> = {
  WDC: {
    name: "Wadan Coin",
    network: "BNB Smart Chain • BEP-20",
    address: "0x1111111111111111111111111111111111111111",
  },
  USDT: {
    name: "Tether USD",
    network: "BNB Smart Chain • BEP-20",
    address: "0x1111111111111111111111111111111111111111",
  },
};

export default function DepositPage() {
  const [asset, setAsset] = useState<Asset>("WDC");
  const [copied, setCopied] = useState(false);
  const current = depositData[asset];

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(current.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
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
          <p>RECEIVE FUNDS</p>
          <h1>Deposit</h1>
          <span>Select an asset, then scan the QR code or copy the full address.</span>
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
              <div><strong>{item}</strong><small>{depositData[item].name}</small></div>
            </button>
          ))}
        </section>

        <section className="deposit-experience">
          <div className="deposit-network">
            <div>
              <small>Selected network</small>
              <strong>{current.network}</strong>
            </div>
            <ShieldCheck size={22}/>
          </div>

          <div className="flow-warning">
            <Info size={20}/>
            <p><strong>Preview address only.</strong> Do not send real funds yet. Production deposit addresses will be connected after wallet/backend setup.</p>
          </div>

          <div className="qr-stage">
            <div className="qr-frame">
              <QRCode
                value={current.address}
                size={256}
                viewBox="0 0 256 256"
                bgColor="#FFFFFF"
                fgColor="#090D13"
                level="M"
                title={`${asset} deposit address on BNB Smart Chain`}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
            <div className="qr-caption"><QrCode size={18}/><span>Scan with your sending wallet</span></div>
          </div>

          <div className="full-address-card">
            <small>{asset} deposit address</small>
            <code>{current.address}</code>
            <button type="button" onClick={copyAddress}>
              {copied ? <Check size={20}/> : <Copy size={20}/>}
              {copied ? "Address copied" : "Copy full address"}
            </button>
          </div>
        </section>

        <section className="flow-instructions">
          <div className="flow-section-title">
            <span>HOW TO DEPOSIT</span>
            <strong>Follow these steps</strong>
          </div>
          <ol>
            <li><span>1</span><div><strong>Select {asset}</strong><p>Open the wallet or exchange you are sending from.</p></div></li>
            <li><span>2</span><div><strong>Choose BNB Smart Chain</strong><p>Use BEP-20 and make sure the network matches exactly.</p></div></li>
            <li><span>3</span><div><strong>Scan or copy</strong><p>Use the QR code or copy the complete address above.</p></div></li>
            <li><span>4</span><div><strong>Review before sending</strong><p>Verify the asset, network and destination before confirming.</p></div></li>
          </ol>
        </section>

        <MobileDock active="/wallet" />
      </section>
    </main>
  );
}
