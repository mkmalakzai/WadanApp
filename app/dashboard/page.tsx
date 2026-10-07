"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowDownUp,
  ArrowUpRight,
  Bell,
  Coins,
  History,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import MobileDock from "../components/MobileDock";
import { fetchCached, readCached } from "../../lib/client-cache";

type WalletSummary = {
  profile:{
    appUserId:string;
    displayName:string;
    country:string;
    status:string;
    emailConfirmed:boolean;
    wdcBalance:number;
    usdtBalance:number;
  };
  wdcPrice:number;
  totalUsd:number;
  totalStaked:number;
  recent:Array<{
    id:string;
    asset:string;
    direction:"credit"|"debit";
    amount:number;
    type:string;
    createdAt:string;
  }>;
};

function title(value:string){
  return value.replace(/_/g," ").replace(/\b\w/g,(char)=>char.toUpperCase());
}

export default function DashboardPage() {
  const [wallet,setWallet]=useState<WalletSummary|null>(()=>readCached<WalletSummary>("wallet:summary"));

  useEffect(()=>{
    void fetchCached<WalletSummary>("wallet:summary","/api/wallet/summary")
      .then(setWallet)
      .catch(()=>undefined);
  },[]);

  const name=wallet?.profile.displayName || "";
  const displayName=name || "—";
  const initials=name ? name.slice(0,2).toUpperCase() : "W";
  const walletReady=Boolean(wallet);
  const wdc=wallet?.profile.wdcBalance ?? 0;
  const usdt=wallet?.profile.usdtBalance ?? 0;
  const totalUsd=wallet?.totalUsd ?? 0;
  const price=wallet?.wdcPrice ?? 0.01;

  return (
    <main className="dash-shell">
      <div className="public-grid-bg" />

      <aside className="dash-sidebar gradient-border">
        <Link href="/" className="public-brand dash-brand">
          <img src="/wadan-mark.svg" alt="WADAN"/>
          <div><strong>WADAN</strong><span>Wadan Coin • WDC</span></div>
        </Link>

        <nav className="dash-nav">
          <Link className="active" href="/dashboard"><LayoutDashboard size={18}/> Dashboard</Link>
          <Link href="/wallet"><WalletCards size={18}/> Wallet</Link>
          <Link href="/referrals"><Users size={18}/> Referrals</Link>
          <Link href="/staking"><Coins size={18}/> Staking</Link>
          <Link href="/history"><History size={18}/> History</Link>
        </nav>

        <div className="dash-security">
          <ShieldCheck size={19}/>
          <div><strong>Account protected</strong><span>Secure account session</span></div>
        </div>

        <nav className="dash-nav bottom">
          <Link href="/account"><UserRound size={18}/> Profile</Link>
          <Link href="/account"><Settings size={18}/> Settings</Link>
        </nav>
      </aside>

      <section className="dash-main">
        <header className="dash-topbar">
          <div>
            <p>WELCOME BACK</p>
            <h1>WADAN</h1>
          </div>
          <div className="dash-top-actions">
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
            <Link href="/account" className="user-chip"><span>{initials}</span><div><strong>{displayName}</strong><small>Member</small></div></Link>
          </div>
        </header>

        <section className="portfolio-v2 portfolio-clean">
          <div className="portfolio-v2-copy">
            <div className="dash-hero-label"><Sparkles size={14}/> PORTFOLIO</div>
            <p>Total value</p>
            <h2>{walletReady ? totalUsd.toLocaleString("en-US",{style:"currency",currency:"USD"}) : "—"}</h2>
            <div className="portfolio-v2-meta">
              <strong>{walletReady ? wdc.toLocaleString("en-US",{maximumFractionDigits:4})+" WDC" : "—"}</strong>
              <span>Available</span>
              <em>BNB Smart Chain</em>
            </div>
          </div>

          <div className="portfolio-v2-breakdown">
            <div><span>WDC</span><strong>{walletReady ? wdc.toLocaleString("en-US",{maximumFractionDigits:4}) : "—"}</strong></div>
            <div><span>USDT</span><strong>{walletReady ? usdt.toLocaleString("en-US",{maximumFractionDigits:4}) : "—"}</strong></div>
            <div><span>Staked</span><strong>{walletReady ? (wallet?.totalStaked ?? 0).toLocaleString("en-US",{maximumFractionDigits:4}) : "—"}</strong></div>
          </div>
        </section>

        <section className="wdc-price-strip" aria-label="WDC price">
          <div className="wdc-price-left">
            <span className="wdc-price-icon"><Coins size={22}/></span>
            <div><small>WDC PRICE</small><strong>{walletReady ? price.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:4,maximumFractionDigits:4}) : "—"}</strong></div>
          </div>
          <div className="wdc-price-right">
            <span>BNB Smart Chain</span>
            <strong>Reference price</strong>
          </div>
        </section>

        <section className="action-section action-section-spaced">
          <div className="section-strip">
            <div><span>QUICK ACTIONS</span><strong>Wallet actions</strong></div>
          </div>
          <div className="action-dock">
            <Link href="/wallet/deposit" className="action-link"><span><ArrowDownToLine size={22}/></span><strong>Deposit</strong><small>Add funds</small></Link>
            <Link href="/wallet/withdraw" className="action-link"><span><ArrowUpRight size={22}/></span><strong>Withdraw</strong><small>Send funds</small></Link>
            <Link href="/wallet/swap" className="action-link"><span><ArrowDownUp size={22}/></span><strong>Swap</strong><small>WDC ⇄ USDT</small></Link>
            <Link href="/staking" className="action-link"><span><Coins size={22}/></span><strong>Stake</strong><small>Earn with WDC</small></Link>
          </div>
        </section>

        <section className="home-activity-section">
          <div className="section-strip">
            <div><span>ACTIVITY</span><strong>Recent transactions</strong></div>
            <Link href="/history" className="home-view-all">View all</Link>
          </div>

          <article className="home-activity-panel">
            {wallet?.recent?.length ? wallet.recent.slice(0,4).map((row)=>(
              <div className="home-activity-row" key={row.id}>
                <span className="home-activity-icon"><History size={16}/></span>
                <div>
                  <strong>{title(row.type)}</strong>
                  <small>{new Date(row.createdAt).toLocaleDateString()} • {row.asset}</small>
                </div>
                <strong className={row.direction==="credit" ? "home-positive" : ""}>
                  {row.direction==="credit" ? "+" : "-"}{row.amount.toLocaleString("en-US",{maximumFractionDigits:6})}
                </strong>
              </div>
            )) : (
              <div className="home-activity-empty">
                <History size={21}/>
                <div><strong>No activity yet</strong><span>Your transactions will appear here.</span></div>
              </div>
            )}
          </article>
        </section>

        <MobileDock active="/dashboard" />
      </section>
    </main>
  );
}
