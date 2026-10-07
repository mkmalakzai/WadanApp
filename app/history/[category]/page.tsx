"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowDownUp,
  ArrowLeft,
  ArrowUpRight,
  Coins,
  Gift,
  History,
} from "lucide-react";
import MobileDock from "../../components/MobileDock";
import styles from "../history.module.css";
import { fetchCached, readCached } from "../../../lib/client-cache";

type Category = "deposit" | "withdraw" | "swap" | "staking" | "referral";

type HistoryRow = {
  id:string;
  type:Category;
  title:string;
  asset:string;
  amount:number;
  status:string;
  date:string;
};

const config:Record<Category,{title:string;eyebrow:string;description:string;back:string}> = {
  deposit:{title:"Deposit History",eyebrow:"DEPOSITS",description:"Every submitted and confirmed deposit in one place.",back:"/wallet/deposit"},
  withdraw:{title:"Withdrawal History",eyebrow:"WITHDRAWALS",description:"Track pending, approved, sent and rejected withdrawals.",back:"/wallet/withdraw"},
  swap:{title:"Swap History",eyebrow:"SWAPS",description:"Your completed WDC and USDT conversions.",back:"/wallet/swap"},
  staking:{title:"Staking History",eyebrow:"STAKING",description:"All staking positions and settlement records.",back:"/staking"},
  referral:{title:"Referral History",eyebrow:"REFERRALS",description:"Referral reward activity and credited earnings.",back:"/referrals"},
};

function icon(type:Category){
  if(type==="deposit") return <ArrowDownLeft size={19}/>;
  if(type==="withdraw") return <ArrowUpRight size={19}/>;
  if(type==="swap") return <ArrowDownUp size={19}/>;
  if(type==="staking") return <Coins size={19}/>;
  return <Gift size={19}/>;
}

function normalizeStatus(value:string){
  return value.replace(/_/g," ").replace(/\b\w/g,(char)=>char.toUpperCase());
}

export default function CategoryHistoryPage(){
  const params=useParams<{category:string}>();
  const raw=String(params?.category || "");
  const category=(["deposit","withdraw","swap","staking","referral"].includes(raw) ? raw : "deposit") as Category;
  const meta=config[category];

  const [rows,setRows]=useState<HistoryRow[]>(()=>readCached<{rows:HistoryRow[]}>("history")?.rows || []);
  const [loading,setLoading]=useState(()=>!readCached<{rows:HistoryRow[]}>("history"));

  useEffect(()=>{
    void fetchCached<{rows:HistoryRow[]}>("history","/api/history")
      .then((data)=>{ if(Array.isArray(data.rows)) setRows(data.rows); })
      .catch(()=>undefined)
      .finally(()=>setLoading(false));
  },[]);

  const visible=useMemo(()=>rows.filter((row)=>row.type===category),[rows,category]);
  const completed=visible.filter((row)=>["confirmed","completed","sent","unlocked","credited"].includes(row.status.toLowerCase())).length;
  const pending=visible.filter((row)=>["pending","detected","approved","active","recorded"].includes(row.status.toLowerCase())).length;

  return (
    <main className="dash-shell premium-surface history-premium">
      <div className="public-grid-bg"/>

      <section className={"dash-main "+styles.main}>
        <header className="dash-topbar">
          <div>
            <p>{meta.eyebrow}</p>
            <h1>{meta.title}</h1>
          </div>
          <Link href={meta.back} className={styles.backButton}><ArrowLeft size={17}/> Back</Link>
        </header>

        <section className={styles.categoryHero}>
          <div>
            <span className={styles.eyebrow}>{icon(category)} {meta.eyebrow} LEDGER</span>
            <h2>{meta.title}</h2>
            <p>{meta.description}</p>
          </div>
          <div className={styles.categoryStats}>
            <div><small>Total</small><strong>{visible.length}</strong></div>
            <div><small>Completed</small><strong>{completed}</strong></div>
            <div><small>Pending</small><strong>{pending}</strong></div>
          </div>
        </section>

        <section className={styles.categoryNav} aria-label="History categories">
          {(Object.keys(config) as Category[]).map((item)=>(
            <Link key={item} href={"/history/"+item} className={item===category ? styles.categoryActive : ""}>
              {icon(item)}<span>{config[item].eyebrow}</span>
            </Link>
          ))}
        </section>

        <section className={styles.ledger}>
          <div className={styles.ledgerHead}>
            <span>Activity</span>
            <span>Asset</span>
            <span>Status</span>
            <span>Date</span>
            <span>Amount</span>
          </div>

          {visible.length ? (
            <div>
              {visible.map((row)=>(
                <article className={styles.row} key={row.type+"-"+row.id}>
                  <div className={styles.activityCell}>
                    <span className={styles.typeIcon}>{icon(row.type)}</span>
                    <div><strong>{row.title}</strong><small>{row.id.slice(0,8)}</small></div>
                  </div>
                  <span>{row.asset}</span>
                  <span>{normalizeStatus(row.status)}</span>
                  <span>{new Date(row.date).toLocaleString()}</span>
                  <strong>{row.amount>0 ? "+" : ""}{row.amount.toLocaleString("en-US",{maximumFractionDigits:6})} {row.asset}</strong>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}><History size={28}/></div>
              <strong>{loading ? "Loading history..." : "No records yet"}</strong>
              <p>{loading ? "Preparing your activity…" : "Your "+meta.eyebrow.toLowerCase()+" activity will appear here automatically."}</p>
            </div>
          )}
        </section>

        <MobileDock />
      </section>
    </main>
  );
}
