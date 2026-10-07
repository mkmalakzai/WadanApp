"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowDownUp,
  ArrowUpRight,
  Bell,
  CircleDollarSign,
  Coins,
  Eye,
  History,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import MobileDock from "../components/MobileDock";
import { fetchCached, readCached } from "../../lib/client-cache";

type WalletSummary = {
  profile: {
    displayName: string;
    email: string;
    kycStatus: string;
    emailConfirmed: boolean;
    wdcBalance: number;
    usdtBalance: number;
  };
  wdcPrice: number;
  totalUsd: number;
  totalStaked: number;
  flags: {
    deposits: boolean;
    withdrawals: boolean;
    swaps: boolean;
  };
  recent: Array<{
    id: string;
    asset: "WDC" | "USDT";
    direction: "credit" | "debit";
    amount: number;
    type: string;
    balanceAfter: number;
    createdAt: string;
  }>;
};

function prettyType(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function WalletPage() {
  const [summary,setSummary]=useState<WalletSummary | null>(()=>readCached<WalletSummary>("wallet:summary"));
  const [hidden,setHidden]=useState(false);

  useEffect(()=>{
    void fetchCached<WalletSummary>("wallet:summary","/api/wallet/summary")
      .then(setSummary)
      .catch(()=>undefined);
    void fetchCached("wallet:deposit","/api/wallet/deposit").catch(()=>undefined);
  },[]);

  const wdc=summary?.profile.wdcBalance ?? 0;
  const usdt=summary?.profile.usdtBalance ?? 0;
  const price=summary?.wdcPrice ?? 0.01;
  const name=summary?.profile.displayName || "Member";
  const initials=name.slice(0,2).toUpperCase();
  const total=summary?.totalUsd ?? 0;

  return (
    <main className="dash-shell">
      <div className="public-grid-bg" />

      <aside className="dash-sidebar gradient-border">
        <Link href="/" className="public-brand dash-brand">
          <img src="/wadan-mark.svg" alt="WADAN"/>
          <div><strong>WADAN</strong><span>Wadan Coin • WDC</span></div>
        </Link>

        <nav className="dash-nav">
          <Link href="/dashboard"><LayoutDashboard size={18}/> Dashboard</Link>
          <Link className="active" href="/wallet"><WalletCards size={18}/> Wallet</Link>
          <Link href="/referrals"><Users size={18}/> Referrals</Link>
          <Link href="/staking"><Coins size={18}/> Staking</Link>
          <Link href="/history"><History size={18}/> History</Link>
        </nav>

        <div className="dash-security">
          <ShieldCheck size={19}/>
          <div><strong>Wallet protected</strong><span>Balances and wallet activity</span></div>
        </div>

        <nav className="dash-nav bottom">
          <Link href="/account"><UserRound size={18}/> Profile</Link>
          <Link href="/account"><Settings size={18}/> Settings</Link>
        </nav>
      </aside>

      <section className="dash-main wallet-main">
        <header className="dash-topbar">
          <div>
            <p>YOUR ASSETS</p>
            <h1>WADAN Wallet</h1>
          </div>
          <div className="dash-top-actions">
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
            <button className="user-chip"><span>{initials}</span><div><strong>{name}</strong><small>Member</small></div></button>
          </div>
        </header>

        <section className="wallet-overview-v2">
          <div className="wallet-total">
            <div>
              <span className="wallet-label"><WalletCards size={15}/> TOTAL WALLET</span>
              <p>Estimated value</p>
              <h2>{!summary ? "—" : hidden ? "••••" : total.toLocaleString("en-US",{style:"currency",currency:"USD"})}</h2>
              <small>Across WDC and USDT</small>
            </div>
            <button className="wallet-eye" aria-label="Toggle balance visibility" onClick={()=>setHidden(!hidden)}><Eye size={19}/></button>
          </div>

          <div className="wallet-balance-grid">
            <article className="wallet-asset-balance wdc-balance">
              <div className="asset-balance-top">
                <span className="asset-symbol">W</span>
                <div><strong>Wadan Coin</strong><small>WDC • BNB Chain</small></div>
              </div>
              <h3>{!summary ? "—" : hidden ? "••••" : wdc.toLocaleString("en-US",{maximumFractionDigits:4})+" WDC"}</h3>
              <div className="asset-balance-foot"><span>{hidden ? "••••" : (wdc*price).toLocaleString("en-US",{style:"currency",currency:"USD"})}</span><em>{price.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:4,maximumFractionDigits:4})} / WDC</em></div>
            </article>

            <article className="wallet-asset-balance usdt-balance">
              <div className="asset-balance-top">
                <span className="asset-symbol usdt"><CircleDollarSign size={22}/></span>
                <div><strong>Tether USD</strong><small>USDT • BNB Chain</small></div>
              </div>
              <h3>{!summary ? "—" : hidden ? "••••" : usdt.toLocaleString("en-US",{maximumFractionDigits:4})+" USDT"}</h3>
              <div className="asset-balance-foot"><span>{hidden ? "••••" : usdt.toLocaleString("en-US",{style:"currency",currency:"USD"})}</span><em>$1.00 / USDT</em></div>
            </article>
          </div>
        </section>

        <section className="wallet-action-section">
          <div className="section-strip">
            <div><span>QUICK TOOLS</span><strong>Manage wallet</strong></div>
            <small>BNB Chain</small>
          </div>
          <div className="wallet-action-dock">
            <Link href="/wallet/deposit" className="wallet-action-link"><span><ArrowDownToLine size={22}/></span><strong>Deposit</strong><small>{!summary ? "Checking…" : summary.flags.deposits ? "Available" : "Unavailable"}</small></Link>
            <Link href="/wallet/withdraw" className="wallet-action-link"><span><ArrowUpRight size={22}/></span><strong>Withdraw</strong><small>{!summary ? "Checking…" : summary.flags.withdrawals ? "Available" : "Unavailable"}</small></Link>
            <Link href="/wallet/swap" className="wallet-action-link"><span><ArrowDownUp size={22}/></span><strong>Swap</strong><small>{!summary ? "Checking…" : summary.flags.swaps ? "Available" : "Unavailable"}</small></Link>
          </div>
        </section>

        <section className="wallet-flow-hint">
          <ShieldCheck size={20}/>
          <div>
            <strong>Wallet activity protected</strong>
            <span>Your balances and transaction history stay synced with your WADAN account.</span>
          </div>
        </section>

        <section className="wallet-grid-v2">
          <article className="wallet-activity-panel">
            <div className="section-strip">
              <div><span>RECENT ACTIVITY</span><strong>Wallet transactions</strong></div>
              <History size={20}/>
            </div>

            <div className="wallet-activity-list">
              {summary?.recent?.length ? summary.recent.map((row,i)=>(
                <div className="wallet-activity-row" key={row.id}>
                  <span className="activity-dot">{i+1}</span>
                  <div><strong>{prettyType(row.type)}</strong><small>{row.asset}</small></div>
                  <div>
                    <strong>{row.direction==="credit" ? "+" : "-"}{row.amount.toLocaleString("en-US",{maximumFractionDigits:6})} {row.asset}</strong>
                    <small>{new Date(row.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              )) : (
                <div className="wallet-activity-row">
                  <span className="activity-dot">—</span>
                  <div><strong>No activity yet</strong><small>Real wallet records will appear here.</small></div>
                  <div><strong>0</strong><small>Live ledger</small></div>
                </div>
              )}
            </div>
          </article>

          <article className="wallet-security-v2">
            <div className="section-strip">
              <div><span>SECURITY</span><strong>Wallet protection</strong></div>
              <ShieldCheck size={20}/>
            </div>

            <div className="wallet-security-list">
              <div><span>Email verification</span><strong>{summary?.profile.emailConfirmed ? "Verified" : "Pending"}</strong></div>
              <div><span>KYC status</span><strong>{(summary?.profile.kycStatus || "not_started").replace("_"," ")}</strong></div>
              <div><span>Network</span><strong>BNB Chain</strong></div>
              <div><span>Wallet status</span><strong className="gold-text">Protected</strong></div>
            </div>
          </article>
        </section>

        <MobileDock active="/wallet" />
      </section>
    </main>
  );
}
