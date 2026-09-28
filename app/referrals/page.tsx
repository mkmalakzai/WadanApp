"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Copy,
  Gift,
  History,
  Home,
  LayoutDashboard,
  Link2,
  Network,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserPlus,
  UserRound,
  Users,
  WalletCards,
  Coins,
} from "lucide-react";

const referralCode = "WDC-MK7A2";
const referralLink = "https://wadan.app/signup?ref=WDC-MK7A2";

const rewardLevels = [
  { level: 1, rate: "5%", relation: "Direct referrals", note: "People you invite personally" },
  { level: 2, rate: "3%", relation: "2nd generation", note: "Referrals invited by Level 1" },
  { level: 3, rate: "2%", relation: "3rd generation", note: "Network depth Level 3" },
  { level: 4, rate: "1%", relation: "4th generation", note: "Network depth Level 4" },
  { level: 5, rate: "0.5%", relation: "5th generation", note: "Network depth Level 5" },
];

const referralRows: Array<{
  id: string;
  name: string;
  level: number;
  joined: string;
  status: "Qualified" | "Pending";
  reward: string;
}> = [];

export default function ReferralsPage() {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [filter, setFilter] = useState<"all" | "1" | "2" | "3" | "4" | "5">("all");

  const visibleRows = useMemo(() => {
    if (filter === "all") return referralRows;
    return referralRows.filter((row) => String(row.level) === filter);
  }, [filter]);

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

        <section className="referral-hero referral-hero-v2">
          <div className="referral-hero-copy">
            <span className="referral-eyebrow"><Users size={15}/> BUILD YOUR NETWORK</span>
            <h2>Invite people. Grow WADAN.</h2>
            <p>One referral link, five reward levels, and a clear view of your full WADAN network.</p>

            <div className="referral-hero-stats">
              <div><small>Total referrals</small><strong>0</strong></div>
              <div><small>Qualified</small><strong>0</strong></div>
              <div><small>Total rewards</small><strong>0 WDC</strong></div>
            </div>
          </div>

          <div className="referral-medal referral-medal-v2">
            <div className="referral-medal-ring"><Network size={38}/></div>
            <span>Network depth</span>
            <strong>5 Levels</strong>
            <small>Multi-level referral rewards</small>
          </div>
        </section>

        <section className="referral-share-section">
          <div className="section-strip">
            <div><span>YOUR INVITE</span><strong>Referral code & link</strong></div>
            <small>Ready to share</small>
          </div>

          <div className="referral-share-grid">
            <article className="referral-code-card">
              <div className="referral-card-label">
                <span><UserPlus size={18}/></span>
                <div><small>Referral code</small><strong>{referralCode}</strong></div>
              </div>
              <button type="button" onClick={()=>copy(referralCode,"code")}>
                {copied==="code" ? <Check size={19}/> : <Copy size={19}/>}
                {copied==="code" ? "Copied" : "Copy"}
              </button>
            </article>

            <article className="referral-link-card">
              <div className="referral-card-label">
                <span><Link2 size={18}/></span>
                <div><small>Referral link</small><strong>wadan.app/signup?ref=…</strong></div>
              </div>
              <div className="referral-link-actions">
                <button type="button" onClick={()=>copy(referralLink,"link")}>
                  {copied==="link" ? <Check size={18}/> : <Copy size={18}/>}
                </button>
                <button type="button" className="share-primary" onClick={share}><Send size={18}/> Share</button>
              </div>
            </article>
          </div>
        </section>

        <section className="referral-reward-section">
          <div className="section-strip">
            <div><span>REWARD SYSTEM</span><strong>5-level referral rewards</strong></div>
            <small>Preview rates</small>
          </div>

          <div className="reward-level-grid">
            {rewardLevels.map((item)=>(
              <article className={item.level===1 ? "primary" : ""} key={item.level}>
                <div className="reward-level-top">
                  <span>L{item.level}</span>
                  <strong>{item.rate}</strong>
                </div>
                <h3>{item.relation}</h3>
                <p>{item.note}</p>
                <div className="reward-level-foot">
                  <Sparkles size={15}/>
                  <span>Share of eligible referral reward</span>
                </div>
              </article>
            ))}
          </div>

          <div className="referral-rule-note">
            <ShieldCheck size={19}/>
            <p>The percentages above are preview settings for the frontend. Final reward eligibility, anti-abuse rules and payout logic will be enforced by the backend before launch.</p>
          </div>
        </section>

        <section className="my-referrals-section">
          <div className="section-strip">
            <div><span>MY NETWORK</span><strong>My referrals</strong></div>
            <small>0 members</small>
          </div>

          <div className="referral-filter-bar">
            {(["all","1","2","3","4","5"] as const).map((item)=>(
              <button
                key={item}
                type="button"
                className={filter===item ? "active" : ""}
                onClick={()=>setFilter(item)}
              >
                {item==="all" ? "All" : `Level ${item}`}
              </button>
            ))}
          </div>

          <div className="referral-table-card">
            <div className="referral-table-head">
              <span>Member</span>
              <span>Level</span>
              <span>Joined</span>
              <span>Status</span>
              <span>Reward</span>
            </div>

            {visibleRows.length > 0 ? (
              <div className="referral-table-body">
                {visibleRows.map((row)=>(
                  <div className="referral-table-row" key={row.id}>
                    <div><span className="mini-avatar">{row.name.slice(0,2).toUpperCase()}</span><strong>{row.name}</strong></div>
                    <span>L{row.level}</span>
                    <span>{row.joined}</span>
                    <span>{row.status}</span>
                    <strong>{row.reward}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="referral-empty referral-empty-v2">
                <div><UserPlus size={28}/></div>
                <strong>No referrals in this view</strong>
                <p>When members join through your referral link, their name, level, join date, qualification status and earned reward will appear here.</p>
              </div>
            )}
          </div>
        </section>

        <section className="referral-summary-grid">
          <article>
            <div className="summary-icon"><Trophy size={20}/></div>
            <small>Highest active level</small>
            <strong>Level 1</strong>
            <span>Starts with your first qualified referral</span>
          </article>
          <article>
            <div className="summary-icon"><Gift size={20}/></div>
            <small>Lifetime referral rewards</small>
            <strong>0 WDC</strong>
            <span>No referral reward credited yet</span>
          </article>
          <article>
            <div className="summary-icon"><Users size={20}/></div>
            <small>Network size</small>
            <strong>0</strong>
            <span>Across all five levels</span>
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
