"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Coins,
  History,
  Info,
  LayoutDashboard,
  LockKeyhole,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import MobileDock from "../components/MobileDock";
import styles from "./staking.module.css";
import { fetchCached, readCached, invalidateCached } from "../../lib/client-cache";

type Plan = {
  id:string;
  title:string;
  duration_days:number;
  dailyRate:number;
  enabled:boolean;
};

type Position = {
  id:string;
  plan_id:string;
  principal:number;
  started_at:string;
  unlock_at:string;
  status:string;
  planTitle:string;
  dailyRate:number;
  durationDays:number;
  dailyProfit:number;
  earnedProfit:number;
  totalProjectedProfit:number;
  completedDays:number;
  daysRemaining:number;
  progressPercent:number;
  remainingPercent:number;
  projectedReward:number;
  matured:boolean;
};

type Overview = {
  profile:{
    displayName:string;
    wdcBalance:number;
  };
  plans:Plan[];
  positions:Position[];
  summary:{
    totalStaked:number;
    todayProfit:number;
    allProfit:number;
    expectedProfit:number;
    activeCount:number;
  };
};

function fmt(value:number,digits=2){
  return value.toLocaleString("en-US",{maximumFractionDigits:digits});
}

export default function StakingPage() {
  const [data,setData]=useState<Overview | null>(()=>readCached<Overview>("staking:overview"));
  const [planId,setPlanId]=useState("");
  const [amount,setAmount]=useState("");
  const [review,setReview]=useState(false);
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  async function load(force=false){
    try{
      const body=await fetchCached<Overview>("staking:overview","/api/staking/overview",{force});
      setData(body);
      setPlanId((current)=>current || body.plans?.find((p)=>p.enabled)?.id || body.plans?.[0]?.id || "");
    }catch(err){
      setError(err instanceof Error ? err.message : "Unable to load staking.");
    }
  }

  useEffect(()=>{void load();},[]);

  const plan=data?.plans.find((item)=>item.id===planId) || data?.plans[0];
  const balance=data?.profile.wdcBalance ?? 0;
  const numericAmount=Number(amount || 0);

  const estimate=useMemo(()=>{
    if(!plan || !Number.isFinite(numericAmount) || numericAmount<=0) return 0;
    return numericAmount*(plan.dailyRate/100)*plan.duration_days;
  },[numericAmount,plan]);

  const dailyEstimate=useMemo(()=>{
    if(!plan || !Number.isFinite(numericAmount) || numericAmount<=0) return 0;
    return numericAmount*(plan.dailyRate/100);
  },[numericAmount,plan]);

  const totalAtEnd=numericAmount+estimate;
  const summary=data?.summary;
  const activePositions=(data?.positions || []).filter((position)=>position.status==="active");

  function choosePlan(next:string){
    setPlanId(next);
    setReview(false);
    setMessage("");
    setError("");
  }

  function shortcut(percent:number){
    setAmount(String((balance*percent).toFixed(6)));
  }

  async function confirmStake(){
    if(!plan) return;
    setLoading(true);
    setMessage("");
    setError("");

    try{
      const response=await fetch("/api/staking/create",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({planId:plan.id,amount:numericAmount}),
      });
      const body=await response.json();
      if(!response.ok) throw new Error(body.error || "Unable to create stake.");

      setMessage("Staking position created successfully.");
      setReview(false);
      setAmount("");
      invalidateCached("wallet:summary","staking:overview","history");
      await load(true);
    }catch(err){
      setError(err instanceof Error ? err.message : "Unable to create stake.");
    }finally{
      setLoading(false);
    }
  }

  async function claim(stakeId:string){
    setLoading(true);
    setMessage("");
    setError("");

    try{
      const response=await fetch("/api/staking/claim",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({stakeId}),
      });
      const body=await response.json();
      if(!response.ok) throw new Error(body.error || "Unable to claim stake.");

      setMessage("Matured position settled to your WDC wallet.");
      invalidateCached("wallet:summary","staking:overview","history");
      await load(true);
    }catch(err){
      setError(err instanceof Error ? err.message : "Unable to claim stake.");
    }finally{
      setLoading(false);
    }
  }

  const name=data?.profile.displayName || "";
  const displayName=name || "—";
  const initials=name ? name.slice(0,2).toUpperCase() : "W";
  const canReview=Boolean(plan?.enabled && numericAmount>0 && numericAmount<=balance);

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
          <div><strong>Staking vault</strong><span>Positions and rewards synced</span></div>
        </div>

        <nav className="dash-nav bottom">
          <Link href="/account"><UserRound size={18}/> Profile</Link>
          <Link href="/account"><Settings size={18}/> Settings</Link>
        </nav>
      </aside>

      <section className={"dash-main "+styles.main}>
        <header className="dash-topbar">
          <div>
            <p>WDC STAKING</p>
            <h1>Staking</h1>
          </div>
          <div className="dash-top-actions">
            <Link href="/history/staking" className="feature-history-link"><History size={17}/><span>History</span></Link>
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
            <button className="user-chip"><span>{initials}</span><div><strong>{displayName}</strong><small>Member</small></div></button>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Sparkles size={15}/> WDC REWARD VAULT</span>
            <h2>Put your WDC to work.</h2>
            <p>Track daily profit, earned rewards and every active position from one clean dashboard.</p>
          </div>
          <div className={styles.heroBalance}>
            <small>Available to stake</small>
            <strong>{data ? fmt(balance,4) : "—"} WDC</strong>
            <span>BNB Smart Chain</span>
          </div>
        </section>

        <section className={styles.profitGrid}>
          <article className={styles.metricPrimary}>
            <div className={styles.metricIcon}><LockKeyhole size={20}/></div>
            <div><small>Total staked</small><strong>{summary ? fmt(summary.totalStaked,4) : "—"} WDC</strong><span>{summary ? summary.activeCount : "—"} active positions</span></div>
          </article>
          <article>
            <div className={styles.metricIconGreen}><TrendingUp size={20}/></div>
            <div><small>Today profit</small><strong>{summary ? fmt(summary.todayProfit,4) : "—"} WDC</strong><span>Daily earning at current rates</span></div>
          </article>
          <article>
            <div className={styles.metricIconBlue}><Coins size={20}/></div>
            <div><small>All profit</small><strong>{summary ? fmt(summary.allProfit,4) : "—"} WDC</strong><span>Completed staking days</span></div>
          </article>
          <article>
            <div className={styles.metricIcon}><Sparkles size={20}/></div>
            <div><small>Expected profit</small><strong>{summary ? fmt(summary.expectedProfit,4) : "—"} WDC</strong><span>At full maturity</span></div>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>PLANS</span><strong>Choose a lock period</strong></div>
            <small>Simple daily reward • no compounding</small>
          </div>

          <div className={styles.planRail}>
            {(data?.plans || []).map((item)=>(
              <button
                type="button"
                key={item.id}
                onClick={()=>choosePlan(item.id)}
                className={planId===item.id ? styles.activePlan : ""}
              >
                <div className={styles.planTop}>
                  <span className={styles.planCode}>{item.id.toUpperCase()}</span>
                  <em>{item.enabled ? "Available" : "Unavailable"}</em>
                </div>
                <strong>{item.title}</strong>
                <div className={styles.planRate}><b>{item.dailyRate.toFixed(2)}%</b><span>per day</span></div>
                <div className={styles.planBottom}>
                  <span><CalendarDays size={15}/>{item.duration_days} days</span>
                  <span>{(item.dailyRate*item.duration_days).toFixed(1)}% total rate</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {plan && !review ? (
          <section className={styles.builder}>
            <div className={styles.builderMain}>
              <div className={styles.builderHead}>
                <div><span>NEW POSITION</span><strong>{plan.title}</strong></div>
                <em>{plan.dailyRate.toFixed(2)}% daily</em>
              </div>

              <div className={styles.balanceRow}>
                <span>Available balance</span>
                <strong>{fmt(balance,6)} WDC</strong>
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
                <div className={styles.shortcuts}>
                  <button type="button" onClick={()=>shortcut(.25)}>25%</button>
                  <button type="button" onClick={()=>shortcut(.5)}>50%</button>
                  <button type="button" onClick={()=>shortcut(.75)}>75%</button>
                  <button type="button" onClick={()=>shortcut(1)}>MAX</button>
                </div>
              </div>

              <div className={styles.builderStats}>
                <div><span>Daily profit</span><strong>{fmt(dailyEstimate,4)} WDC</strong></div>
                <div><span>Estimated profit</span><strong>{fmt(estimate,4)} WDC</strong></div>
                <div><span>Estimated total</span><strong>{fmt(totalAtEnd,4)} WDC</strong></div>
              </div>

              <div className={styles.notice}>
                <Info size={18}/>
                <p>Rewards are calculated per completed 24-hour staking day using the configured simple daily rate.</p>
              </div>

              {error && <div className="auth-live-message error">{error}</div>}
              {message && <div className="auth-live-message success">{message}</div>}

              <button type="button" className={styles.primary} disabled={!canReview} onClick={()=>setReview(true)}>
                Review position <ArrowRight size={19}/>
              </button>
            </div>

            <aside className={styles.builderSide}>
              <div className={styles.sideMark}><Coins size={26}/></div>
              <span>Selected plan</span>
              <strong>{plan.title}</strong>
              <div className={styles.sideRows}>
                <div><span>Daily rate</span><strong>{plan.dailyRate.toFixed(2)}%</strong></div>
                <div><span>Duration</span><strong>{plan.duration_days} days</strong></div>
                <div><span>Compounding</span><strong>Off</strong></div>
                <div><span>Early unlock</span><strong>Unavailable</strong></div>
              </div>
            </aside>
          </section>
        ) : plan ? (
          <section className={styles.review}>
            <div className={styles.reviewIcon}><CheckCircle2 size={30}/></div>
            <span>REVIEW POSITION</span>
            <h2>Confirm your staking details</h2>
            <div className={styles.reviewGrid}>
              <div><span>Plan</span><strong>{plan.title}</strong></div>
              <div><span>Amount</span><strong>{fmt(numericAmount,4)} WDC</strong></div>
              <div><span>Daily profit</span><strong>{fmt(dailyEstimate,4)} WDC</strong></div>
              <div><span>Daily rate</span><strong>{plan.dailyRate.toFixed(2)}%</strong></div>
              <div><span>Estimated profit</span><strong>{fmt(estimate,4)} WDC</strong></div>
              <div><span>Estimated total</span><strong>{fmt(totalAtEnd,4)} WDC</strong></div>
            </div>
            {error && <div className="auth-live-message error">{error}</div>}
            <button type="button" className={styles.primary} disabled={loading} onClick={confirmStake}>
              {loading ? "Creating..." : "Confirm staking"} <ShieldCheck size={19}/>
            </button>
            <button type="button" className={styles.secondary} onClick={()=>setReview(false)}>Go back</button>
          </section>
        ) : null}

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>POSITIONS</span><strong>Your staking positions</strong></div>
            <small>{data?.positions.length || 0} total</small>
          </div>

          {data?.positions.length ? (
            <div className={styles.positions}>
              {data.positions.map((position)=>{
                const complete=Math.min(100,Math.max(0,position.progressPercent || 0));
                return (
                  <article className={styles.positionCard} key={position.id}>
                    <div className={styles.positionHead}>
                      <div>
                        <span className={styles.positionPlan}>{position.planTitle}</span>
                        <strong>{fmt(position.principal,4)} WDC</strong>
                      </div>
                      <em className={position.status==="active" ? styles.liveStatus : styles.closedStatus}>{position.status}</em>
                    </div>

                    <div className={styles.positionMetrics}>
                      <div><small>Daily profit</small><strong>{fmt(position.dailyProfit,4)} WDC</strong></div>
                      <div><small>Earned profit</small><strong>{fmt(position.earnedProfit,4)} WDC</strong></div>
                      <div><small>Full profit</small><strong>{fmt(position.totalProjectedProfit,4)} WDC</strong></div>
                      <div><small>Daily rate</small><strong>{position.dailyRate.toFixed(2)}%</strong></div>
                    </div>

                    <div className={styles.progressBlock}>
                      <div className={styles.progressLabels}>
                        <span>{complete.toFixed(1)}% complete</span>
                        <strong>{position.remainingPercent.toFixed(1)}% remaining</strong>
                      </div>
                      <div className={styles.progressTrack}><span style={{width:complete+"%"}} /></div>
                      <div className={styles.progressMeta}>
                        <span>{position.completedDays} days earned</span>
                        <span>{position.daysRemaining} days remaining</span>
                      </div>
                    </div>

                    <div className={styles.positionFooter}>
                      <div><small>Started</small><strong>{new Date(position.started_at).toLocaleDateString()}</strong></div>
                      <div><small>Unlock</small><strong>{new Date(position.unlock_at).toLocaleDateString()}</strong></div>
                      {position.status==="active" && position.matured && (
                        <button type="button" disabled={loading} onClick={()=>claim(position.id)}>Claim position</button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <div><LockKeyhole size={26}/></div>
              <strong>No staking positions yet</strong>
              <p>Create your first WDC staking position above.</p>
            </div>
          )}
        </section>

        <MobileDock active="/staking" />
      </section>
    </main>
  );
}
