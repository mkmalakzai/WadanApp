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
  TrendingUp,
  UserCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import MobileDock from "../components/MobileDock";
import "./portfolio.css";
import { fetchCached, readCached } from "../../lib/client-cache";
import { settlePendingWalletRewards } from "../../lib/client-staking-rewards";

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
  portfolioUsd?:number;
  availableUsd?:number;
  stakedUsd?:number;
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
    let live=true;
    void (async () => {
      await settlePendingWalletRewards().catch(() => null);
      if(!live) return;
      await Promise.allSettled([
        fetchCached<WalletSummary>("wallet:summary","/api/wallet/summary",{force:true}).then(v=>{if(live)setWallet(v)}),
        fetchCached<StakingOverview>("staking:overview","/api/staking/overview",{force:true}).then(v=>{if(live)setStaking(v)}),
        fetchCached<ReferralOverview>("referrals:overview","/api/referrals/overview").then(v=>{if(live)setReferral(v)}),
      ]);
    })();
    return ()=>{live=false};
  },[]);

  const name=wallet?.profile.displayName || "";
  const displayName=name || "Member";
  const initials=name ? name.slice(0,2).toUpperCase() : "W";
  const walletReady=Boolean(wallet);
  const stakingReady=Boolean(staking);

  const wdc=wallet?.profile.wdcBalance ?? 0;
  const spendableUsd=wallet?.availableUsd ?? wallet?.totalUsd ?? 0;
  const price=wallet?.wdcPrice ?? 0.01;
  const totalStaked=wallet?.totalStaked ?? staking?.summary?.totalStaked ?? 0;
  const portfolioUsd=spendableUsd;
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

        <section className="wadan-carddeck" aria-label="WADAN portfolio">
          <div className="wadan-luxury-card">
            <div className="wadan-luxury-ornament" aria-hidden="true" />
            <div className="wadan-luxury-top">
              <div className="wadan-luxury-brand">
                <img src="/wadan-mark.svg" alt="" />
                <span><strong>WADAN</strong><small>PERSONAL PORTFOLIO</small></span>
              </div>
              <span className="wadan-luxury-chain"><i /> BNB SMART CHAIN</span>
            </div>

            <div className="wadan-luxury-main">
              <div className="wadan-luxury-balance">
                <span className="wadan-luxury-label">AVAILABLE PORTFOLIO VALUE</span>
                <strong>{walletReady ? portfolioUsd.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}) : "—"}</strong>
                <p>Spendable assets · USD equivalent</p>
              </div>
              <div className="wadan-luxury-seal" aria-hidden="true"><img src="/wadan-mark.svg" alt="" /></div>
            </div>

            <div className="wadan-luxury-assets">
              <div className="wadan-luxury-asset">
                <span className="wadan-luxury-asset-label"><b className="wdc-token-icon">W</b> WDC BALANCE</span>
                <strong>{walletReady ? fmt(wdc,4) : "—"} <small>WDC</small></strong>
              </div>
              <div className="wadan-luxury-asset">
                <span className="wadan-luxury-asset-label"><b className="usdt-token-icon">$</b> USDT BALANCE</span>
                <strong>{walletReady ? fmt(wallet?.profile.usdtBalance ?? 0,4) : "—"} <small>USDT</small></strong>
              </div>
            </div>

            <div className="wadan-luxury-footer">
              <span><ShieldCheck size={15}/> Locked stake not included in available balance</span>
              <Link href="/wallet">Open wallet <ArrowUpRight size={16}/></Link>
            </div>
          </div>

          <div className="wadan-luxury-stats">
            <Link href="/staking" className="wadan-luxury-stat locked">
              <span className="wadan-luxury-stat-head"><b><LockKeyhole size={20}/></b><ArrowUpRight size={17}/></span>
              <span className="wadan-luxury-stat-title">Total staked</span>
              <strong>{stakingReady ? fmt(totalStaked,4) : "—"} <small>WDC</small></strong>
              <span className="wadan-luxury-stat-foot">Locked staking balance</span>
            </Link>
            <Link href="/staking" className="wadan-luxury-stat earned">
              <span className="wadan-luxury-stat-head"><b><TrendingUp size={20}/></b><ArrowUpRight size={17}/></span>
              <span className="wadan-luxury-stat-title">Today earned</span>
              <strong>{stakingReady ? fmt(todayEarned,4) : "—"} <small>WDC</small></strong>
              <span className="wadan-luxury-stat-foot">Daily staking earnings</span>
            </Link>
            <Link href="/staking" className="wadan-luxury-stat all-profit">
              <span className="wadan-luxury-stat-head"><b><Coins size={20}/></b><ArrowUpRight size={17}/></span>
              <span className="wadan-luxury-stat-title">All profit</span>
              <strong>{stakingReady ? fmt(allProfit,4) : "—"} <small>WDC</small></strong>
              <span className="wadan-luxury-stat-foot">Total staking earnings</span>
            </Link>
          </div>
          <div className="wadan-luxury-price">
            <span><i /> WDC APP PRICE <strong>{walletReady ? price.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:4,maximumFractionDigits:6}) : "—"}</strong></span>
            <small>Admin-set price · Not a market quote</small>
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
          <div className="premium-section-head premium-section-head-simple">
            <div><h2>Quick Actions</h2></div>
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
          <div className="premium-section-head premium-section-head-simple">
            <div><h2>Explore WADAN</h2></div>
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
              <div><strong>Security</strong><small>2FA & sessions</small></div>
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
