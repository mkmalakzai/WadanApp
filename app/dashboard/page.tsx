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
  Gift,
  History,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import MobileDock from "../components/MobileDock";
import ExploreShortcuts from "../components/ExploreShortcuts";
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

type StakingOverview = {
  positions:Array<{
    status:string;
    projectedReward:number;
  }>;
  plans:Array<{
    id:string;
    title:string;
    enabled:boolean;
  }>;
};

type ReferralOverview = {
  code?:string;
  total?:number;
  lifetime_rewards?:number|string;
};

function title(value:string){
  return value.replace(/_/g," ").replace(/\b\w/g,(char)=>char.toUpperCase());
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

  const name=wallet?.profile.displayName || "Member";
  const initials=name.slice(0,2).toUpperCase();
  const wdc=wallet?.profile.wdcBalance ?? 0;
  const usdt=wallet?.profile.usdtBalance ?? 0;
  const totalUsd=wallet?.totalUsd ?? 0;
  const price=wallet?.wdcPrice ?? 0.01;
  const activePositions=(staking?.positions || []).filter((item)=>item.status==="active");
  const projectedRewards=activePositions.reduce((sum,item)=>sum+Number(item.projectedReward || 0),0);
  const referralTotal=Number(referral.total || 0);
  const referralRewards=Number(referral.lifetime_rewards || 0);

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
            <h1>WADAN Dashboard</h1>
          </div>
          <div className="dash-top-actions">
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
            <button className="user-chip"><span>{initials}</span><div><strong>{name}</strong><small>Member</small></div></button>
          </div>
        </header>

        <section className="portfolio-v2 portfolio-clean">
          <div className="portfolio-v2-copy">
            <div className="dash-hero-label"><Sparkles size={14}/> PORTFOLIO OVERVIEW</div>
            <p>Total portfolio value</p>
            <h2>{totalUsd.toLocaleString("en-US",{style:"currency",currency:"USD"})}</h2>
            <div className="portfolio-v2-meta">
              <strong>{wdc.toLocaleString("en-US",{maximumFractionDigits:4})} WDC</strong>
              <span>Available balance</span>
              <em>BNB Smart Chain</em>
            </div>
          </div>

          <div className="portfolio-v2-breakdown">
            <div><span>Available</span><strong>{wdc.toLocaleString("en-US",{maximumFractionDigits:4})} WDC</strong></div>
            <div><span>USDT</span><strong>{usdt.toLocaleString("en-US",{maximumFractionDigits:4})}</strong></div>
            <div><span>Staked</span><strong>{(wallet?.totalStaked ?? 0).toLocaleString("en-US",{maximumFractionDigits:4})} WDC</strong></div>
          </div>
        </section>

        <section className="wdc-price-strip" aria-label="WDC price">
          <div className="wdc-price-left">
            <span className="wdc-price-icon"><Coins size={23}/></span>
            <div>
              <small>WDC PRICE</small>
              <strong>{price.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:4,maximumFractionDigits:4})}</strong>
            </div>
          </div>
          <div className="wdc-price-right">
            <span>BNB Smart Chain</span>
            <strong>WADAN reference price</strong>
          </div>
        </section>

        <section className="action-section action-section-spaced">
          <div className="section-strip">
            <div><span>QUICK ACTIONS</span><strong>Move your assets</strong></div>
            <small>Available now</small>
          </div>

          <div className="action-dock">
            <Link href="/wallet/deposit" className="action-link"><span><ArrowDownToLine size={23}/></span><strong>Deposit</strong><small>Add funds</small></Link>
            <Link href="/wallet/withdraw" className="action-link"><span><ArrowUpRight size={23}/></span><strong>Withdraw</strong><small>Send funds</small></Link>
            <Link href="/wallet/swap" className="action-link"><span><ArrowDownUp size={23}/></span><strong>Swap</strong><small>USDT ⇄ WDC</small></Link>
            <Link href="/staking" className="action-link"><span><Coins size={23}/></span><strong>Stake</strong><small>Lock WDC</small></Link>
          </div>
        </section>

        <ExploreShortcuts />

        <section className="overview-section">
          <div className="section-strip">
            <div><span>OVERVIEW</span><strong>Account snapshot</strong></div>
          </div>

          <div className="overview-grid-v2 overview-grid-three">
            <article><span className="overview-icon"><CircleDollarSign size={21}/></span><div><small>Total Staked</small><strong>{(wallet?.totalStaked ?? 0).toLocaleString("en-US",{maximumFractionDigits:4})} WDC</strong><em>{activePositions.length} active positions</em></div></article>
            <article><span className="overview-icon"><Gift size={21}/></span><div><small>Projected rewards</small><strong>{projectedRewards.toLocaleString("en-US",{maximumFractionDigits:4})} WDC</strong><em>Current staking estimate</em></div></article>
            <article><span className="overview-icon"><Users size={21}/></span><div><small>Referrals</small><strong>{referralTotal}</strong><em>{referralRewards.toLocaleString("en-US",{maximumFractionDigits:4})} WDC credited</em></div></article>
          </div>
        </section>

        <section className="dash-two-col content-spacer">
          <article className="dash-panel gradient-border">
            <div className="dash-panel-head">
              <div><p>STAKING</p><h3>Your staking plans</h3></div>
              <Trophy size={20}/>
            </div>

            <div className="staking-cards">
              {(staking?.plans || []).map((plan)=>(
                <div className="staking-card" key={plan.id}>
                  <div className="staking-badge">{plan.id.toUpperCase()}</div>
                  <div><strong>{plan.title}</strong><span>{plan.enabled ? "Available" : "Unavailable"}</span></div>
                  <Link href="/staking">View plan</Link>
                </div>
              ))}
            </div>
          </article>

          <article className="dash-panel gradient-border">
            <div className="dash-panel-head">
              <div><p>REFERRAL</p><h3>Invite & grow</h3></div>
              <Gift size={20}/>
            </div>
            <div className="referral-box">
              <span>Your referral code</span>
              <div><strong>{referral.code || "Loading..."}</strong></div>
              <small>{referralTotal} members tracked in your network.</small>
            </div>
          </article>
        </section>

        <section className="dash-two-col lower">
          <article className="dash-panel gradient-border">
            <div className="dash-panel-head">
              <div><p>RECENT ACTIVITY</p><h3>Transactions</h3></div>
              <History size={20}/>
            </div>
            <div className="dash-activity">
              {wallet?.recent?.length ? wallet.recent.slice(0,3).map((row,i)=>(
                <div key={row.id}>
                  <span className="activity-dot">{i+1}</span>
                  <div><strong>{title(row.type)}</strong><small>{row.asset}</small></div>
                  <div className="activity-right"><strong>{row.direction==="credit" ? "+" : "-"}{row.amount.toLocaleString("en-US",{maximumFractionDigits:6})} {row.asset}</strong><small>{new Date(row.createdAt).toLocaleDateString()}</small></div>
                </div>
              )) : (
                <div>
                  <span className="activity-dot">—</span>
                  <div><strong>No activity yet</strong><small>Your activity will appear here</small></div>
                  <div className="activity-right"><strong>0</strong><small>Records</small></div>
                </div>
              )}
            </div>
          </article>

          <article className="dash-panel gradient-border">
            <div className="dash-panel-head">
              <div><p>ACCOUNT</p><h3>Profile summary</h3></div>
              <UserRound size={20}/>
            </div>
            <div className="profile-summary">
              <div className="profile-large">{initials}</div>
              <div><strong>{name}</strong><span>{wallet?.profile.emailConfirmed ? "Email verified" : "Email pending"}</span></div>
            </div>
            <div className="profile-lines">
              <div><span>Member ID</span><strong>{wallet?.profile.appUserId ? "WDC-"+wallet.profile.appUserId.slice(0,8).toUpperCase() : "—"}</strong></div>
              <div><span>Country</span><strong>{wallet?.profile.country || "—"}</strong></div>
              <div><span>Account tier</span><strong>Standard</strong></div>
              <div><span>Status</span><strong className="gold-text">{wallet?.profile.status || "—"}</strong></div>
            </div>
          </article>
        </section>

        <MobileDock active="/dashboard" />
      </section>
    </main>
  );
}
