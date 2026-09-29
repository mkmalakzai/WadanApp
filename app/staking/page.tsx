"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Coins,
  History,
  Home,
  Info,
  LayoutDashboard,
  LockKeyhole,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import styles from "./staking.module.css";

type PlanId = "6M" | "12M";

const plans = {
  "6M": {
    id: "6M" as PlanId,
    title: "6 Month",
    days: 180,
    dailyRate: 0.6,
    label: "Balanced lock",
    note: "Medium-term WDC staking",
  },
  "12M": {
    id: "12M" as PlanId,
    title: "12 Month",
    days: 365,
    dailyRate: 0.7,
    label: "Long-term",
    note: "Higher preview reward rate",
  },
};

export default function StakingPage() {
  const [planId, setPlanId] = useState<PlanId>("6M");
  const [amount, setAmount] = useState("");
  const [review, setReview] = useState(false);

  const plan = plans[planId];
  const numericAmount = Number(amount || 0);

  const estimate = useMemo(() => {
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return 0;
    return numericAmount * (plan.dailyRate / 100) * plan.days;
  }, [numericAmount, plan]);

  const totalAtEnd = numericAmount + estimate;
  const canReview = numericAmount > 0;

  function choosePlan(next: PlanId) {
    setPlanId(next);
    setReview(false);
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
          <Link href="/referrals"><Users size={18}/> Referrals</Link>
          <Link className="active" href="/staking"><Coins size={18}/> Staking</Link>
          <Link href="/history"><History size={18}/> History</Link>
        </nav>

        <div className="dash-security">
          <ShieldCheck size={19}/>
          <div><strong>Staking controls</strong><span>Rates and rewards are verified by backend rules</span></div>
        </div>

        <nav className="dash-nav bottom">
          <a href="#"><UserRound size={18}/> Profile</a>
          <a href="#"><Settings size={18}/> Settings</a>
        </nav>
      </aside>

      <section className={"dash-main " + styles.main}>
        <header className="dash-topbar">
          <div>
            <p>WDC STAKING</p>
            <h1>Staking Center</h1>
          </div>
          <div className="dash-top-actions">
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
            <button className="user-chip"><span>MK</span><div><strong>Malakzai</strong><small>Member</small></div></button>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Sparkles size={15}/> WDC REWARD VAULT</span>
            <h2>Lock WDC. Track rewards. Stay in control.</h2>
            <p>Choose a staking period, review the projected reward, and manage every position from one place.</p>
          </div>

          <div className={styles.heroStats}>
            <div><small>Total staked</small><strong>0 WDC</strong><span>$0.00</span></div>
            <div><small>Claimable rewards</small><strong>0 WDC</strong><span>No active position</span></div>
            <div><small>Active positions</small><strong>0</strong><span>Nothing locked yet</span></div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>CHOOSE PLAN</span><strong>Select your lock period</strong></div>
            <small>Preview rates</small>
          </div>

          <div className={styles.planRail}>
            {(Object.values(plans) as Array<(typeof plans)[PlanId]>).map((item)=>(
              <button
                type="button"
                key={item.id}
                onClick={()=>choosePlan(item.id)}
                className={planId===item.id ? styles.activePlan : ""}
              >
                <div className={styles.planPeriod}>
                  <span>{item.id}</span>
                  <div><strong>{item.title}</strong><small>{item.note}</small></div>
                </div>

                <div className={styles.planRate}>
                  <small>Preview daily rate</small>
                  <strong>{item.dailyRate.toFixed(2)}%</strong>
                </div>

                <div className={styles.planMeta}>
                  <span><CalendarDays size={15}/>{item.days} days</span>
                  <span><LockKeyhole size={15}/>{item.label}</span>
                </div>

                <ChevronRight size={20} className={styles.planArrow}/>
              </button>
            ))}
          </div>
        </section>

        {!review ? (
          <section className={styles.stakeBuilder}>
            <div className={styles.builderMain}>
              <div className={styles.builderHead}>
                <div>
                  <span>STAKE BUILDER</span>
                  <strong>{plan.title} Plan</strong>
                </div>
                <em>{plan.dailyRate.toFixed(2)}% / day preview</em>
              </div>

              <div className={styles.balanceLine}>
                <span>Available WDC</span>
                <strong>0.00 WDC</strong>
              </div>

              <div className={styles.amountBox}>
                <div className={styles.amountTop}>
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(e)=>setAmount(e.target.value.replace(/[^0-9.]/g,""))}
                    placeholder="0.00"
                    aria-label="WDC amount to stake"
                  />
                  <span>WDC</span>
                </div>
                <div className={styles.amountFoot}>
                  <span>≈ {"$" + (numericAmount * 0.01).toFixed(2)}</span>
                  <div>
                    {["25%","50%","75%","MAX"].map((item)=>(
                      <button key={item} type="button" onClick={()=>setAmount("0")}>{item}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.projection}>
                <div>
                  <span>Lock period</span>
                  <strong>{plan.days} days</strong>
                </div>
                <div>
                  <span>Projected reward</span>
                  <strong>{estimate.toFixed(2)} WDC</strong>
                </div>
                <div>
                  <span>Projected total</span>
                  <strong>{totalAtEnd.toFixed(2)} WDC</strong>
                </div>
              </div>

              <div className={styles.notice}>
                <Info size={19}/>
                <p>Reward figures are illustrative frontend estimates based on the preview daily rate. Final rates, eligibility, claim rules and payout logic will be enforced by the backend before launch.</p>
              </div>

              <button type="button" className={styles.primary} disabled={!canReview} onClick={()=>setReview(true)}>
                Review staking position <ChevronRight size={20}/>
              </button>
            </div>

            <aside className={styles.builderSide}>
              <div className={styles.sideIcon}><Trophy size={30}/></div>
              <span>Selected plan</span>
              <strong>{plan.title}</strong>
              <small>{plan.dailyRate.toFixed(2)}% daily preview</small>

              <div className={styles.sideFacts}>
                <div><span>Duration</span><strong>{plan.days} days</strong></div>
                <div><span>Compounding</span><strong>Off</strong></div>
                <div><span>Early unlock</span><strong>Not enabled</strong></div>
                <div><span>Asset</span><strong>WDC</strong></div>
              </div>
            </aside>
          </section>
        ) : (
          <section className={styles.review}>
            <div className={styles.reviewIcon}><CheckCircle2 size={34}/></div>
            <p>REVIEW POSITION</p>
            <h2>Check the staking details.</h2>

            <div className={styles.reviewGrid}>
              <div><span>Plan</span><strong>{plan.title}</strong></div>
              <div><span>Stake amount</span><strong>{numericAmount.toFixed(2)} WDC</strong></div>
              <div><span>Lock period</span><strong>{plan.days} days</strong></div>
              <div><span>Preview daily rate</span><strong>{plan.dailyRate.toFixed(2)}%</strong></div>
              <div><span>Projected reward</span><strong>{estimate.toFixed(2)} WDC</strong></div>
              <div><span>Projected total</span><strong>{totalAtEnd.toFixed(2)} WDC</strong></div>
            </div>

            <button type="button" className={styles.primary + " " + styles.disabledLook}>
              Confirm staking <ShieldCheck size={20}/>
            </button>
            <button type="button" className={styles.secondary} onClick={()=>setReview(false)}>Go back and edit</button>

            <div className={styles.notice}>
              <Info size={19}/>
              <p>Final confirmation is disabled until live balances, authentication, staking ledger rules and backend settlement are connected.</p>
            </div>
          </section>
        )}

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>YOUR POSITIONS</span><strong>Active staking</strong></div>
            <small>0 positions</small>
          </div>

          <div className={styles.emptyPositions}>
            <div className={styles.emptyIcon}><LockKeyhole size={30}/></div>
            <strong>No active staking positions</strong>
            <p>Your active plan, principal, accrued rewards, start date and unlock date will appear here.</p>
          </div>
        </section>

        <section className={styles.howItWorks}>
          <div className={styles.sectionHead}>
            <div><span>HOW IT WORKS</span><strong>Three simple steps</strong></div>
          </div>

          <div className={styles.steps}>
            <div><span>01</span><div><strong>Choose a plan</strong><p>Select 6 months or 12 months.</p></div></div>
            <div><span>02</span><div><strong>Lock WDC</strong><p>Review the amount and staking conditions.</p></div></div>
            <div><span>03</span><div><strong>Track rewards</strong><p>Follow accrued rewards and unlock timing.</p></div></div>
          </div>
        </section>

        <nav className="dash-mobile-nav gradient-border">
          <Link href="/dashboard"><Home size={19}/><span>Home</span></Link>
          <Link href="/wallet"><WalletCards size={19}/><span>Wallet</span></Link>
          <Link href="/referrals"><Users size={19}/><span>Referral</span></Link>
          <Link className="active" href="/staking"><Coins size={19}/><span>Stake</span></Link>
          <a href="#"><UserRound size={19}/><span>Profile</span></a>
        </nav>
      </section>
    </main>
  );
}
