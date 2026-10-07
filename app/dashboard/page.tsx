"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowDownUp,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Coins,
  Gift,
  LayoutDashboard,
  LockKeyhole,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
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
};

type StakingOverview = {
  summary:{
    totalStaked:number;
    todayProfit:number;
    allProfit:number;
    expectedProfit:number;
    activeCount:number;
  };
};

type ReferralOverview = {
  total?:number;
};

function fmt(value:number,digits=4){
  return value.toLocaleString("en-US",{maximumFractionDigits:digits});
}

export default function DashboardPage() {
  const [wallet,setWallet]=useState<WalletSummary|null>(()=>readCached<WalletSummary>("wallet:summary"));
  const [staking,setStaking]=useState<StakingOverview|null>(()=>readCached<StakingOverview>("staking:overview"));
  const [referral,setReferral]=useState<ReferralOverview>(()=>readCached<ReferralOverview>("referrals:overview") || {});

  useEffect(()=>{
    void Promise.all([
      fetchCached<WalletSummary>("wallet:summary","/api/wallet/summary").then(setWallet),
      fetchCached<StakingOverview>("staking:overview","/api/staking/overview").then(setStaking),
      fetchCached<ReferralOverview>("referrals:overview","/api/referrals/overview").then(setReferral),
    ]).catch(()=>undefined);
  },[]);

  const name=wallet?.profile.displayName || "";
  const displayName=name || "Member";
  const initials=name ? name.slice(0,2).toUpperCase() : "W";
  const walletReady=Boolean(wallet);
  const stakingReady=Boolean(staking);

  const wdc=wallet?.profile.wdcBalance ?? 0;
  const totalUsd=wallet?.totalUsd ?? 0;
  const price=wallet?.wdcPrice ?? 0.01;
  const totalStaked=staking?.summary?.totalStaked ?? wallet?.totalStaked ?? 0;
  const todayEarned=staking?.summary?.todayProfit ?? 0;
  const allProfit=staking?.summary?.allProfit ?? 0;
  const expectedProfit=staking?.summary?.expectedProfit ?? 0;
  const activePositions=staking?.summary?.activeCount ?? 0;
  const referrals=Number(referral.total || 0);

  return (
    <main className="dash-shell premium-dashboard">
      <div className="premium-dashboard-aurora" />
      <div className="premium-dashboard-noise" />

      <aside className="dash-sidebar premium-sidebar">
        <Link href="/" className="public-brand dash-brand">
          <img src="/wadan-mark.svg" alt="WADAN"/>
          <div><strong>WADAN</strong><span>Wadan Coin • WDC</span></div>
        </Link>

        <nav className="dash-nav">
          <Link className="active" href="/dashboard"><LayoutDashboard size={18}/> Dashboard</Link>
          <Link href="/wallet"><WalletCards size={18}/> Wallet</Link>
          <Link href="/referrals"><Users size={18}/> Referrals</Link>
          <Link href="/staking"><Coins size={18}/> Staking</Link>
        </nav>

        <div className="dash-security">
          <ShieldCheck size={19}/>
          <div><strong>Protected account</strong><span>Secure WADAN session</span></div>
        </div>

        <nav className="dash-nav bottom">
          <Link href="/account"><UserRound size={18}/> Profile</Link>
          <Link href="/account"><Settings size={18}/> Settings</Link>
        </nav>
      </aside>

      <section className="dash-main premium-dashboard-main">
        <header className="premium-header">
          <div>
            <p>WELCOME BACK</p>
            <h1><span>WADAN</span> Dashboard</h1>
          </div>

          <div className="premium-header-actions">
            <button className="premium-icon-button" aria-label="Notifications"><Bell size={20}/><i /></button>
            <Link href="/account" className="premium-avatar" aria-label="Open profile">
              <span>{initials}</span>
            </Link>
          </div>
        </header>

        <section className="premium-portfolio">
          <div className="premium-portfolio-art" aria-hidden="true">
            <img src="/wadan-premium-coin.svg" alt="" />
          </div>

          <div className="premium-portfolio-top">
            <span className="premium-kicker"><Sparkles size={15}/> PORTFOLIO OVERVIEW</span>
            <span className="premium-network"><Coins size={16}/> BNB Smart Chain <ChevronRight size={16}/></span>
          </div>

          <div className="premium-portfolio-value">
            <small>Total portfolio value</small>
            <strong>{walletReady ? totalUsd.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}) : "—"}</strong>
            <p><b>{walletReady ? fmt(wdc,4) : "—"} WDC</b><span>available balance</span></p>
          </div>

          <div className="premium-portfolio-stats">
            <div>
              <span className="premium-stat-icon copper"><Coins size={19}/></span>
              <div><small>Total Staked</small><strong>{stakingReady ? fmt(totalStaked,4) : "—"} WDC</strong></div>
            </div>
            <div>
              <span className="premium-stat-icon teal"><TrendingUp size={19}/></span>
              <div><small>Today Earned</small><strong>{stakingReady ? fmt(todayEarned,4) : "—"} WDC</strong></div>
            </div>
            <div>
              <span className="premium-stat-icon amber"><Gift size={19}/></span>
              <div><small>All Profit</small><strong>{stakingReady ? fmt(allProfit,4) : "—"} WDC</strong></div>
            </div>
          </div>
        </section>

        <section className="premium-metric-grid">
          <Link href="/referrals" className="premium-metric-card copper-card">
            <span className="premium-metric-icon"><Users size={25}/></span>
            <div><small>Total Referrals</small><strong>{referrals}</strong></div>
            <ChevronRight size={20}/>
          </Link>

          <Link href="/wallet" className="premium-metric-card cyan-card">
            <span className="premium-metric-icon"><Coins size={25}/></span>
            <div><small>WDC Price</small><strong>{walletReady ? price.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:4,maximumFractionDigits:4}) : "—"}</strong></div>
            <ChevronRight size={20}/>
          </Link>

          <Link href="/staking" className="premium-metric-card teal-card">
            <span className="premium-metric-icon"><LockKeyhole size={25}/></span>
            <div><small>Active Positions</small><strong>{stakingReady ? activePositions : "—"}</strong></div>
            <ChevronRight size={20}/>
          </Link>

          <Link href="/staking" className="premium-metric-card violet-card">
            <span className="premium-metric-icon"><Gift size={25}/></span>
            <div><small>Projected Rewards</small><strong>{stakingReady ? fmt(expectedProfit,4)+" WDC" : "—"}</strong></div>
            <ChevronRight size={20}/>
          </Link>
        </section>

        <section className="premium-section">
          <div className="premium-section-head">
            <div><span>QUICK ACTIONS</span><h2>Move your assets</h2></div>
          </div>

          <div className="premium-actions">
            <Link href="/wallet/deposit" className="premium-action action-copper">
              <span><ArrowDownToLine size={28}/></span><strong>Deposit</strong>
            </Link>
            <Link href="/wallet/withdraw" className="premium-action action-teal">
              <span><ArrowUpRight size={28}/></span><strong>Withdraw</strong>
            </Link>
            <Link href="/wallet/swap" className="premium-action action-blue">
              <span><ArrowDownUp size={28}/></span><strong>Swap</strong>
            </Link>
            <Link href="/staking" className="premium-action action-copper">
              <span><Coins size={28}/></span><strong>Stake</strong>
            </Link>
          </div>
        </section>

        <section className="premium-section premium-explore-section">
          <div className="premium-section-head">
            <div><span>DISCOVER</span><h2>Explore WADAN</h2></div>
            <Link href="/explore">View all <ChevronRight size={16}/></Link>
          </div>

          <div className="premium-explore-grid">
            <Link href="/explore" className="premium-explore-card explore-copper">
              <span><Gift size={22}/></span>
              <div><strong>Free Earnings</strong><small>Tasks & campaigns</small></div>
              <ChevronRight size={20}/>
            </Link>

            <Link href="/account" className="premium-explore-card explore-teal">
              <span><UserCheck size={22}/></span>
              <div><strong>KYC</strong><small>Verify identity</small></div>
              <ChevronRight size={20}/>
            </Link>

            <Link href="/account?tab=security" className="premium-explore-card explore-blue">
              <span><ShieldCheck size={22}/></span>
              <div><strong>Security</strong><small>Account protection</small></div>
              <ChevronRight size={20}/>
            </Link>
          </div>
        </section>

        <div className="premium-dashboard-spacer" />

        <MobileDock active="/dashboard" />
      </section>
    </main>
  );
}
