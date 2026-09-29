"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  Check,
  Copy,
  History,
  Home,
  LayoutDashboard,
  Link2,
  Network,
  Send,
  Settings,
  ShieldCheck,
  UserPlus,
  UserRound,
  Users,
  WalletCards,
  Coins,
} from "lucide-react";
import styles from "./referrals.module.css";

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
          <Link className="active" href="/referrals"><Users size={18}/> Referrals</Link>
          <Link href="/staking"><Coins size={18}/> Staking</Link>
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

      <section className={`dash-main ${styles.main}`}>
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

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Users size={15}/> BUILD YOUR NETWORK</span>
            <h2>Invite people. Grow WADAN.</h2>
            <p>One referral link, one premium network overview, and five reward levels working together.</p>
          </div>
        </section>

        <section className={styles.spotlightSection}>
          <article className={styles.referralSpotlight}>
            <div className={styles.spotlightLead}>
              <span className={styles.spotlightEyebrow}><Network size={16}/> REFERRAL OVERVIEW</span>
              <small>Total referrals</small>
              <strong>0</strong>
              <p>Your complete WADAN network across all five levels.</p>
            </div>

            <div className={styles.spotlightMetrics}>
              <div>
                <span>Qualified</span>
                <strong>0</strong>
                <small>Eligible members</small>
              </div>
              <div>
                <span>Lifetime rewards</span>
                <strong>0 WDC</strong>
                <small>Referral earnings</small>
              </div>
              <div>
                <span>Active level</span>
                <strong>Level 1</strong>
                <small>Direct network</small>
              </div>
              <div>
                <span>Network depth</span>
                <strong>5 Levels</strong>
                <small>Full reward structure</small>
              </div>
            </div>

            <div className={styles.spotlightReward}>
              <span>Current direct reward</span>
              <strong>5%</strong>
              <small>Level 1 eligible reward share</small>
            </div>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>YOUR INVITE</span><strong>Referral code & link</strong></div>
            <small>Ready to share</small>
          </div>

          <div className={styles.shareGrid}>
            <article className={styles.shareCard}>
              <div className={styles.shareLabel}>
                <span className={styles.shareIcon}><UserPlus size={18}/></span>
                <div><small>Referral code</small><strong>{referralCode}</strong></div>
              </div>
              <button className={styles.copyBtn} type="button" onClick={()=>copy(referralCode,"code")}>
                {copied==="code" ? <Check size={18}/> : <Copy size={18}/>}
                {copied==="code" ? "Copied" : "Copy"}
              </button>
            </article>

            <article className={styles.shareCard}>
              <div className={styles.shareLabel}>
                <span className={styles.shareIcon}><Link2 size={18}/></span>
                <div><small>Referral link</small><strong>wadan.app/signup?ref=…</strong></div>
              </div>
              <div className={styles.shareActions}>
                <button className={styles.iconBtn} type="button" aria-label="Copy referral link" onClick={()=>copy(referralLink,"link")}>
                  {copied==="link" ? <Check size={18}/> : <Copy size={18}/>}
                </button>
                <button className={styles.shareBtn} type="button" onClick={share}><Send size={17}/> Share</button>
              </div>
            </article>
          </div>
        </section>



        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>MY NETWORK</span><strong>My referrals</strong></div>
            <small>0 members</small>
          </div>

          <div className={styles.filterBar}>
            {(["all","1","2","3","4","5"] as const).map((item)=>(
              <button
                key={item}
                type="button"
                className={filter===item ? styles.active : ""}
                onClick={()=>setFilter(item)}
              >
                {item==="all" ? "All" : `Level ${item}`}
              </button>
            ))}
          </div>

          <div className={styles.networkCard}>
            {visibleRows.length > 0 ? (
              <>
                <div className={styles.tableHead}>
                  <span>Member</span>
                  <span>Level</span>
                  <span>Joined</span>
                  <span>Status</span>
                  <span>Reward</span>
                </div>
                <div>
                  {visibleRows.map((row)=>(
                    <div className={styles.tableRow} key={row.id}>
                      <div className={styles.memberCell}><span className={styles.avatar}>{row.name.slice(0,2).toUpperCase()}</span><strong>{row.name}</strong></div>
                      <span>L{row.level}</span>
                      <span>{row.joined}</span>
                      <span>{row.status}</span>
                      <strong>{row.reward}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}><UserPlus size={28}/></div>
                <strong>No referrals in this view</strong>
                <p>When members join through your referral link, their name, level, join date, qualification status and earned reward will appear here.</p>
              </div>
            )}
          </div>

        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>REWARD SYSTEM</span><strong>5-level referral rewards</strong></div>
            <small>Preview rates</small>
          </div>

          <div className={styles.rewardJourney}>
            <div className={styles.rewardTrack} aria-hidden="true"><span /></div>

            {rewardLevels.map((item,index)=>(
              <div className={styles.rewardStep} key={item.level}>
                <div className={styles.rewardNodeWrap}>
                  <div className={styles.rewardNode}>L{item.level}</div>
                  <span className={styles.rewardIndex}>0{index+1}</span>
                </div>

                <div className={styles.rewardStepBody}>
                  <div className={styles.rewardStepTop}>
                    <strong className={styles.rewardPercent}>{item.rate}</strong>
                    <span>reward share</span>
                  </div>
                  <h3>{item.relation}</h3>
                  <p>{item.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.ruleNote}>
            <ShieldCheck size={19}/>
            <p>The rates above are preview settings. Final eligibility, anti-abuse rules and payout logic will be enforced by the backend before launch.</p>
          </div>
        </section>

        <nav className="dash-mobile-nav gradient-border">
          <Link href="/dashboard"><Home size={19}/><span>Home</span></Link>
          <Link href="/wallet"><WalletCards size={19}/><span>Wallet</span></Link>
          <Link className="active" href="/referrals"><Users size={19}/><span>Referral</span></Link>
          <Link href="/staking"><Coins size={19}/><span>Stake</span></Link>
          <a href="#"><UserRound size={19}/><span>Profile</span></a>
        </nav>
      </section>
    </main>
  );
}
