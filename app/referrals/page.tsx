"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Check,
  Copy,
  Gift,
  History,
  Home,
  LayoutDashboard,
  Link2,
  Medal,
  Send,
  Settings,
  ShieldCheck,
  Trophy,
  UserPlus,
  UserRound,
  Users,
  WalletCards,
  Coins,
} from "lucide-react";

const referralCode = "WDC-MK7A2";
const referralLink = "https://wadan.app/signup?ref=WDC-MK7A2";

const levels = [
  { name: "Starter", target: "0–9", bonus: "Base rewards", active: true },
  { name: "Builder", target: "10–49", bonus: "Milestone perks", active: false },
  { name: "Leader", target: "50+", bonus: "Community tier", active: false },
];

export default function ReferralsPage() {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  async function copy(value: string, type: "code" | "link") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join WADAN",
          text: "Join the WADAN ecosystem with my referral link.",
          url: referralLink,
        });
      } catch {}
    } else {
      await copy(referralLink, "link");
    }
  }

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
          <Link href="/wallet"><WalletCards size={18}/> Wallet</Link>
          <Link className="active" href="/referrals"><Gift size={18}/> Referrals</Link>
          <a href="#"><Coins size={18}/> Staking</a>
          <a href="#"><History size={18}/> History</a>
        </nav>

        <div className="dash-security">
          <ShieldCheck size={19}/>
          <div><strong>Referral integrity</strong><span>Rewards and eligibility will be verified</span></div>
        </div>

        <nav className="dash-nav bottom">
          <a href="#"><UserRound size={18}/> Profile</a>
          <a href="#"><Settings size={18}/> Settings</a>
        </nav>
      </aside>

      <section className="dash-main referral-main">
        <header className="dash-topbar">
          <div>
            <p>COMMUNITY</p>
            <h1>Referral Center</h1>
          </div>
          <div className="dash-top-actions">
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
            <button className="user-chip"><span>MK</span><div><strong>Malakzai</strong><small>Member</small></div></button>
          </div>
        </header>

        <section className="referral-hero">
          <div className="referral-hero-copy">
            <span className="referral-eyebrow"><Users size={15}/> BUILD YOUR NETWORK</span>
            <h2>Invite people.<br/>Grow WADAN.</h2>
            <p>Your personal referral space for invites, network growth and future WDC referral rewards.</p>

            <div className="referral-hero-stats">
              <div><small>Total referrals</small><strong>0</strong></div>
              <div><small>Qualified</small><strong>0</strong></div>
              <div><small>Rewards</small><strong>0 WDC</strong></div>
            </div>
          </div>

          <div className="referral-medal">
            <div className="referral-medal-ring"><Trophy size={42}/></div>
            <span>Current tier</span>
            <strong>Starter</strong>
            <small>Invite your first member</small>
          </div>
        </section>

        <section className="referral-share-section">
          <div className="section-strip">
            <div><span>YOUR INVITE</span><strong>Share WADAN</strong></div>
            <small>Personal referral</small>
          </div>

          <div className="referral-share-grid">
            <article className="referral-code-card">
              <div className="referral-card-label"><span><UserPlus size={18}/></span><div><small>Referral code</small><strong>{referralCode}</strong></div></div>
              <button type="button" onClick={()=>copy(referralCode,"code")}>
                {copied==="code" ? <Check size={19}/> : <Copy size={19}/>}
                {copied==="code" ? "Copied" : "Copy code"}
              </button>
            </article>

            <article className="referral-link-card">
              <div className="referral-card-label"><span><Link2 size={18}/></span><div><small>Invite link</small><strong>wadan.app/ref/…</strong></div></div>
              <div className="referral-link-actions">
                <button type="button" onClick={()=>copy(referralLink,"link")}>
                  {copied==="link" ? <Check size={18}/> : <Copy size={18}/>}
                </button>
                <button type="button" className="share-primary" onClick={share}><Send size={18}/> Share</button>
              </div>
            </article>
          </div>
        </section>

        <section className="referral-progress-section">
          <div className="section-strip">
            <div><span>PROGRESS</span><strong>Referral tiers</strong></div>
            <small>Preview structure</small>
          </div>

          <div className="referral-levels">
            {levels.map((level,index)=>(
              <article className={level.active ? "active" : ""} key={level.name}>
                <div className="level-icon">{index===0 ? <UserPlus size={21}/> : index===1 ? <Medal size={21}/> : <Trophy size={21}/>}</div>
                <div className="level-copy"><small>{level.target} referrals</small><strong>{level.name}</strong><span>{level.bonus}</span></div>
                <em>{level.active ? "Current" : "Locked"}</em>
              </article>
            ))}
          </div>
        </section>

        <section className="referral-lower-grid">
          <article className="referral-panel">
            <div className="section-strip">
              <div><span>NETWORK</span><strong>Your referrals</strong></div>
              <Users size={20}/>
            </div>
            <div className="referral-empty">
              <div><UserPlus size={28}/></div>
              <strong>No referrals yet</strong>
              <p>Share your referral link. New members who join through it will appear here once the backend is connected.</p>
            </div>
          </article>

          <article className="referral-panel">
            <div className="section-strip">
              <div><span>REWARDS</span><strong>Referral earnings</strong></div>
              <Gift size={20}/>
            </div>
            <div className="referral-reward-summary">
              <small>Lifetime referral rewards</small>
              <strong>0 WDC</strong>
              <span>Reward rules will be finalized before public launch.</span>
            </div>
          </article>
        </section>

        <nav className="dash-mobile-nav gradient-border">
          <Link href="/dashboard"><Home size={19}/><span>Home</span></Link>
          <Link href="/wallet"><WalletCards size={19}/><span>Wallet</span></Link>
          <Link className="active" href="/referrals"><Gift size={19}/><span>Referral</span></Link>
          <a href="#"><Coins size={19}/><span>Stake</span></a>
          <a href="#"><UserRound size={19}/><span>Profile</span></a>
        </nav>
      </section>
    </main>
  );
}
