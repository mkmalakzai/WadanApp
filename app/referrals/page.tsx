"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  Copy,
  History,
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
import MobileDock from "../components/MobileDock";
import styles from "./referrals.module.css";
import { fetchCached, readCached } from "../../lib/client-cache";

type Member = {
  id:string;
  name:string;
  level:number;
  status:string;
  joined:string;
};

type ReferralData = {
  code?:string;
  total?:number;
  qualified?:number;
  lifetime_rewards?:number | string;
  rates?:Array<number | string>;
  members?:Member[];
};

const relations = [
  ["Direct referrals","People you invite personally"],
  ["2nd generation","Referrals invited by Level 1"],
  ["3rd generation","Network depth Level 3"],
  ["4th generation","Network depth Level 4"],
  ["5th generation","Network depth Level 5"],
];

export default function ReferralsPage() {
  const [data,setData]=useState<ReferralData>(()=>readCached<ReferralData>("referrals:overview") || {});
  const [copied,setCopied]=useState<"code" | "link" | null>(null);
  const [filter,setFilter]=useState<"all"|"1"|"2"|"3"|"4"|"5">("all");

  useEffect(()=>{
    void fetchCached<ReferralData>("referrals:overview","/api/referrals/overview")
      .then(setData)
      .catch(()=>undefined);
  },[]);

  const code=data.code || "Loading...";
  const referralLink=typeof window!=="undefined" && data.code
    ? window.location.origin+"/signup?ref="+encodeURIComponent(data.code)
    : "";

  const members=Array.isArray(data.members) ? data.members : [];
  const visibleRows=useMemo(()=>{
    if(filter==="all") return members;
    return members.filter((row)=>String(row.level)===filter);
  },[members,filter]);

  const rates=Array.isArray(data.rates) && data.rates.length===5
    ? data.rates.map((value)=>Number(value))
    : [5,3,2,1,.5];

  async function copy(value:string,type:"code"|"link"){
    try{
      await navigator.clipboard.writeText(value);
      setCopied(type);
      window.setTimeout(()=>setCopied(null),1600);
    }catch{
      setCopied(null);
    }
  }

  async function share(){
    if(!referralLink) return;
    if(navigator.share){
      try{
        await navigator.share({
          title:"Join WADAN",
          text:"Join the WADAN ecosystem with my referral link.",
          url:referralLink,
        });
      }catch{}
    }else{
      await copy(referralLink,"link");
    }
  }

  const rewardTotal=Number(data.lifetime_rewards || 0);
  const total=Number(data.total || 0);
  const qualified=Number(data.qualified || 0);

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
          <Link href="/history"><History size={18}/> History</Link>
        </nav>

        <div className="dash-security">
          <ShieldCheck size={19}/>
          <div><strong>Referral integrity</strong><span>Network tracking active</span></div>
        </div>

        <nav className="dash-nav bottom">
          <Link href="/account"><UserRound size={18}/> Profile</Link>
          <Link href="/account"><Settings size={18}/> Settings</Link>
        </nav>
      </aside>

      <section className={"dash-main "+styles.main}>
        <header className="dash-topbar">
          <div>
            <p>COMMUNITY</p>
            <h1>Referral Center</h1>
          </div>
          <div className="dash-top-actions">
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Users size={15}/> BUILD YOUR NETWORK</span>
            <h2>Invite people. Grow WADAN.</h2>
            <p>Invite friends, follow your network depth and track rewards in one place.</p>
          </div>
        </section>

        <section className={styles.spotlightSection}>
          <article className={styles.referralSpotlight}>
            <div className={styles.spotlightLead}>
              <span className={styles.spotlightEyebrow}><Network size={16}/> REFERRAL OVERVIEW</span>
              <small>Total referrals</small>
              <strong>{total}</strong>
              <p>Your complete WADAN network across all five levels.</p>
            </div>

            <div className={styles.spotlightMetrics}>
              <div>
                <span>Qualified</span>
                <strong>{qualified}</strong>
                <small>Eligible members</small>
              </div>
              <div>
                <span>Lifetime rewards</span>
                <strong>{rewardTotal.toLocaleString("en-US",{maximumFractionDigits:4})} WDC</strong>
                <small>Credited referral earnings</small>
              </div>
              <div>
                <span>Direct members</span>
                <strong>{members.filter((row)=>row.level===1).length}</strong>
                <small>Level 1 network</small>
              </div>
              <div>
                <span>Network depth</span>
                <strong>{members.length ? Math.max(...members.map((row)=>row.level)) : 0} / 5</strong>
                <small>Current depth</small>
              </div>
            </div>

            <div className={styles.spotlightReward}>
              <span>Configured direct rate</span>
              <strong>{rates[0]}%</strong>
              <small>Current Level 1 rate</small>
            </div>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>YOUR INVITE</span><strong>Referral code & link</strong></div>
            <small>{data.code ? "Ready to share" : "Loading..."}</small>
          </div>

          <div className={styles.shareGrid}>
            <article className={styles.shareCard}>
              <div className={styles.shareLabel}>
                <span className={styles.shareIcon}><UserPlus size={18}/></span>
                <div><small>Referral code</small><strong>{code}</strong></div>
              </div>
              <button className={styles.copyBtn} type="button" disabled={!data.code} onClick={()=>copy(code,"code")}>
                {copied==="code" ? <Check size={18}/> : <Copy size={18}/>}
                {copied==="code" ? "Copied" : "Copy"}
              </button>
            </article>

            <article className={styles.shareCard}>
              <div className={styles.shareLabel}>
                <span className={styles.shareIcon}><Link2 size={18}/></span>
                <div><small>Referral link</small><strong>{referralLink ? referralLink.replace(/^https?:\/\//,"") : "Loading..."}</strong></div>
              </div>
              <div className={styles.shareActions}>
                <button className={styles.iconBtn} type="button" aria-label="Copy referral link" disabled={!referralLink} onClick={()=>copy(referralLink,"link")}>
                  {copied==="link" ? <Check size={18}/> : <Copy size={18}/>}
                </button>
                <button className={styles.shareBtn} type="button" disabled={!referralLink} onClick={share}><Send size={17}/> Share</button>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>MY NETWORK</span><strong>My referrals</strong></div>
            <small>{members.length} members</small>
          </div>

          <div className={styles.filterBar}>
            {(["all","1","2","3","4","5"] as const).map((item)=>(
              <button
                key={item}
                type="button"
                className={filter===item ? styles.active : ""}
                onClick={()=>setFilter(item)}
              >
                {item==="all" ? "All" : "Level "+item}
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
                      <span>{new Date(row.joined).toLocaleDateString()}</span>
                      <span>{row.status}</span>
                      <strong>Tracked</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}><UserPlus size={28}/></div>
                <strong>No referrals in this view</strong>
                <p>Members who join with your referral link will appear here automatically.</p>
              </div>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>REWARD SYSTEM</span><strong>5-level referral settings</strong></div>
            <small>Current structure</small>
          </div>

          <div className={styles.rewardJourney}>
            <div className={styles.rewardTrack} aria-hidden="true"><span /></div>

            {rates.map((rate,index)=>(
              <div className={styles.rewardStep} key={index}>
                <div className={styles.rewardNodeWrap}>
                  <div className={styles.rewardNode}>L{index+1}</div>
                  <span className={styles.rewardIndex}>0{index+1}</span>
                </div>

                <div className={styles.rewardStepBody}>
                  <div className={styles.rewardStepTop}>
                    <strong className={styles.rewardPercent}>{rate}%</strong>
                    <span>configured share</span>
                  </div>
                  <h3>{relations[index][0]}</h3>
                  <p>{relations[index][1]}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.ruleNote}>
            <ShieldCheck size={19}/>
            <p>Referral activity is tracked automatically. Rewards follow the current WADAN referral rules.</p>
          </div>
        </section>

        <MobileDock active="/referrals" />
      </section>
    </main>
  );
}
