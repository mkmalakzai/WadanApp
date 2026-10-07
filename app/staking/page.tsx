"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Coins,
  History,
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
};

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
      setPlanId((current)=>current || body.plans?.find((p:Plan)=>p.enabled)?.id || body.plans?.[0]?.id || "");
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

  const totalAtEnd=numericAmount+estimate;
  const totalStaked=(data?.positions || []).filter((p)=>p.status==="active").reduce((sum,p)=>sum+p.principal,0);
  const rewardEstimate=(data?.positions || []).filter((p)=>p.status==="active").reduce((sum,p)=>sum+p.projectedReward,0);
  const activeCount=(data?.positions || []).filter((p)=>p.status==="active").length;

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
      setMessage("Matured staking position settled to your WDC wallet.");
      await load();
    }catch(err){
      setError(err instanceof Error ? err.message : "Unable to claim stake.");
    }finally{
      setLoading(false);
    }
  }

  const name=data?.profile.displayName || "Member";
  const initials=name.slice(0,2).toUpperCase();
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
          <div><strong>Staking controls</strong><span>Plans and wallet balances synced</span></div>
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
            <h1>Staking Center</h1>
          </div>
          <div className="dash-top-actions">
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
            <button className="user-chip"><span>{initials}</span><div><strong>{name}</strong><small>Member</small></div></button>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Sparkles size={15}/> WDC REWARD VAULT</span>
            <h2>Lock WDC. Track rewards. Stay in control.</h2>
            <p>Choose a plan, lock WDC and follow your active positions.</p>
          </div>

          <div className={styles.heroStats}>
            <div><small>Total staked</small><strong>{totalStaked.toLocaleString("en-US",{maximumFractionDigits:4})} WDC</strong><span>Active principal</span></div>
            <div><small>Projected accrued</small><strong>{rewardEstimate.toLocaleString("en-US",{maximumFractionDigits:4})} WDC</strong><span>Current estimate</span></div>
            <div><small>Active positions</small><strong>{activeCount}</strong><span>{activeCount ? "Tracked" : "Nothing locked yet"}</span></div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>CHOOSE PLAN</span><strong>Select your lock period</strong></div>
            <small>Available plans</small>
          </div>

          <div className={styles.planRail}>
            {(data?.plans || []).map((item)=>(
              <button
                type="button"
                key={item.id}
                onClick={()=>choosePlan(item.id)}
                className={planId===item.id ? styles.activePlan : ""}
              >
                <div className={styles.planPeriod}>
                  <span>{item.id.toUpperCase()}</span>
                  <div><strong>{item.title}</strong><small>{item.enabled ? "Available" : "Unavailable"}</small></div>
                </div>

                <div className={styles.planRate}>
                  <small>Daily rate</small>
                  <strong>{item.dailyRate.toFixed(2)}%</strong>
                </div>

                <div className={styles.planMeta}>
                  <span><CalendarDays size={15}/>{item.duration_days} days</span>
                  <span><LockKeyhole size={15}/>{item.enabled ? "Enabled" : "Disabled"}</span>
                </div>

                <ChevronRight size={20} className={styles.planArrow}/>
              </button>
            ))}
          </div>
        </section>

        {plan && !review ? (
          <section className={styles.stakeBuilder}>
            <div className={styles.builderMain}>
              <div className={styles.builderHead}>
                <div>
                  <span>STAKE BUILDER</span>
                  <strong>{plan.title}</strong>
                </div>
                <em>{plan.dailyRate.toFixed(2)}% / day</em>
              </div>

              <div className={styles.balanceLine}>
                <span>Available WDC</span>
                <strong>{balance.toLocaleString("en-US",{maximumFractionDigits:6})} WDC</strong>
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
                  <span>Balance-backed amount</span>
                  <div>
                    <button type="button" onClick={()=>shortcut(.25)}>25%</button>
                    <button type="button" onClick={()=>shortcut(.5)}>50%</button>
                    <button type="button" onClick={()=>shortcut(.75)}>75%</button>
                    <button type="button" onClick={()=>shortcut(1)}>MAX</button>
                  </div>
                </div>
              </div>

              <div className={styles.projection}>
                <div><span>Lock period</span><strong>{plan.duration_days} days</strong></div>
                <div><span>Projected reward</span><strong>{estimate.toFixed(2)} WDC</strong></div>
                <div><span>Projected total</span><strong>{totalAtEnd.toFixed(2)} WDC</strong></div>
              </div>

              <div className={styles.notice}>
                <Info size={19}/>
                <p>Reward estimates follow the current backend plan rate. The plan must be enabled by the admin before a position can be created.</p>
              </div>

              {error && <div className="auth-live-message error">{error}</div>}
              {message && <div className="auth-live-message success">{message}</div>}

              <button type="button" className={styles.primary} disabled={!canReview} onClick={()=>setReview(true)}>
                Review staking position <ChevronRight size={20}/>
              </button>
            </div>

            <aside className={styles.builderSide}>
              <div className={styles.sideIcon}><Trophy size={30}/></div>
              <span>Selected plan</span>
              <strong>{plan.title}</strong>
              <small>{plan.dailyRate.toFixed(2)}% daily rate</small>

              <div className={styles.sideFacts}>
                <div><span>Duration</span><strong>{plan.duration_days} days</strong></div>
                <div><span>Compounding</span><strong>Off</strong></div>
                <div><span>Early unlock</span><strong>Not enabled</strong></div>
                <div><span>Status</span><strong>{plan.enabled ? "Live" : "Disabled"}</strong></div>
              </div>
            </aside>
          </section>
        ) : plan ? (
          <section className={styles.review}>
            <div className={styles.reviewIcon}><CheckCircle2 size={34}/></div>
            <p>REVIEW POSITION</p>
            <h2>Check the staking details.</h2>

            <div className={styles.reviewGrid}>
              <div><span>Plan</span><strong>{plan.title}</strong></div>
              <div><span>Stake amount</span><strong>{numericAmount.toFixed(2)} WDC</strong></div>
              <div><span>Lock period</span><strong>{plan.duration_days} days</strong></div>
              <div><span>Daily rate</span><strong>{plan.dailyRate.toFixed(2)}%</strong></div>
              <div><span>Projected reward</span><strong>{estimate.toFixed(2)} WDC</strong></div>
              <div><span>Projected total</span><strong>{totalAtEnd.toFixed(2)} WDC</strong></div>
            </div>

            {error && <div className="auth-live-message error">{error}</div>}

            <button type="button" className={styles.primary} disabled={loading} onClick={confirmStake}>
              {loading ? "Creating..." : "Confirm staking"} <ShieldCheck size={20}/>
            </button>
            <button type="button" className={styles.secondary} onClick={()=>setReview(false)}>Go back and edit</button>
          </section>
        ) : null}

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>YOUR POSITIONS</span><strong>Staking positions</strong></div>
            <small>{data?.positions.length || 0} positions</small>
          </div>

          {data?.positions.length ? (
            <div className={styles.planRail}>
              {data.positions.map((position)=>(
                <div key={position.id} className={styles.emptyPositions}>
                  <div className={styles.emptyIcon}><LockKeyhole size={26}/></div>
                  <strong>{position.planTitle} • {position.principal.toLocaleString("en-US",{maximumFractionDigits:4})} WDC</strong>
                  <p>Unlock: {new Date(position.unlock_at).toLocaleDateString()} • Status: {position.status} • Estimated accrued: {position.projectedReward.toFixed(2)} WDC</p>
                  {position.status==="active" && position.matured && (
                    <button type="button" className={styles.primary} disabled={loading} onClick={()=>claim(position.id)}>
                      Claim matured position
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyPositions}>
              <div className={styles.emptyIcon}><LockKeyhole size={30}/></div>
              <strong>No staking positions</strong>
              <p>Your live positions will appear here after you stake WDC.</p>
            </div>
          )}
        </section>

        <MobileDock active="/staking" />
      </section>
    </main>
  );
}
