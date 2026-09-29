"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowDownUp,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Coins,
  Download,
  Gift,
  History,
  Home,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import styles from "./history.module.css";

type Filter = "all" | "deposit" | "withdraw" | "swap" | "staking" | "referral";

type HistoryRow = {
  id: string;
  type: Exclude<Filter,"all">;
  title: string;
  asset: string;
  amount: string;
  status: "Completed" | "Pending" | "Failed";
  date: string;
};

const historyRows: HistoryRow[] = [];

const filters: Array<{id:Filter;label:string}> = [
  {id:"all",label:"All activity"},
  {id:"deposit",label:"Deposits"},
  {id:"withdraw",label:"Withdrawals"},
  {id:"swap",label:"Swaps"},
  {id:"staking",label:"Staking"},
  {id:"referral",label:"Referral"},
];

function TypeIcon({type}:{type:HistoryRow["type"]}) {
  if (type==="deposit") return <ArrowDownLeft size={20}/>;
  if (type==="withdraw") return <ArrowUpRight size={20}/>;
  if (type==="swap") return <ArrowDownUp size={20}/>;
  if (type==="staking") return <Coins size={20}/>;
  return <Gift size={20}/>;
}

export default function HistoryPage(){
  const [filter,setFilter]=useState<Filter>("all");
  const [query,setQuery]=useState("");

  const visible=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return historyRows.filter((row)=>{
      const matchesFilter=filter==="all" || row.type===filter;
      const matchesQuery=!q || [row.id,row.title,row.asset,row.status].join(" ").toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  },[filter,query]);

  return (
    <main className="dash-shell">
      <div className="public-grid-bg"/>

      <aside className="dash-sidebar gradient-border">
        <Link href="/" className="public-brand dash-brand">
          <img src="/wadan-mark.svg" alt="WADAN"/>
          <div><strong>WADAN</strong><span>Wadan Coin • WDC</span></div>
        </Link>

        <nav className="dash-nav">
          <Link href="/dashboard"><LayoutDashboard size={18}/> Dashboard</Link>
          <Link href="/wallet"><WalletCards size={18}/> Wallet</Link>
          <Link href="/referrals"><Users size={18}/> Referrals</Link>
          <Link href="/staking"><Coins size={18}/> Staking</Link>
          <Link className="active" href="/history"><History size={18}/> History</Link>
        </nav>

        <div className="dash-security">
          <ShieldCheck size={19}/>
          <div><strong>Activity ledger</strong><span>Your account events will be recorded here</span></div>
        </div>

        <nav className="dash-nav bottom">
          <a href="#"><UserRound size={18}/> Profile</a>
          <a href="#"><Settings size={18}/> Settings</a>
        </nav>
      </aside>

      <section className={"dash-main "+styles.main}>
        <header className="dash-topbar">
          <div>
            <p>ACCOUNT ACTIVITY</p>
            <h1>History</h1>
          </div>
          <div className="dash-top-actions">
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
            <button className="user-chip"><span>MK</span><div><strong>Malakzai</strong><small>Member</small></div></button>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><History size={15}/> COMPLETE ACTIVITY LEDGER</span>
            <h2>Every move.<br/>One clean history.</h2>
            <p>Deposits, withdrawals, swaps, staking and referral rewards will appear here in one searchable timeline.</p>
          </div>

          <div className={styles.heroStats}>
            <div><small>Total activity</small><strong>0</strong><span>All time</span></div>
            <div><small>Completed</small><strong>0</strong><span>No records yet</span></div>
            <div><small>Pending</small><strong>0</strong><span>Nothing processing</span></div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span>FILTERS</span><strong>Find an activity</strong></div>
            <small>Live backend later</small>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={18}/>
              <input
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                placeholder="Search transaction, asset or status"
                aria-label="Search activity"
              />
            </div>
            <button className={styles.dateBtn} type="button"><CalendarDays size={18}/> Date range</button>
            <button className={styles.exportBtn} type="button" disabled><Download size={18}/> Export</button>
          </div>

          <div className={styles.filters}>
            {filters.map((item)=>(
              <button
                key={item.id}
                type="button"
                className={filter===item.id ? styles.active : ""}
                onClick={()=>setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
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
                <article className={styles.row} key={row.id}>
                  <div className={styles.activityCell}>
                    <span className={styles.typeIcon}><TypeIcon type={row.type}/></span>
                    <div><strong>{row.title}</strong><small>{row.id}</small></div>
                  </div>
                  <span>{row.asset}</span>
                  <span>{row.status}</span>
                  <span>{row.date}</span>
                  <strong>{row.amount}</strong>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}><History size={30}/></div>
              <strong>No activity yet</strong>
              <p>Your real deposits, withdrawals, swaps, staking events and referral rewards will appear here after the backend is connected.</p>
            </div>
          )}
        </section>

        <section className={styles.legend}>
          <div><span className={styles.legendIcon}><ArrowDownLeft size={18}/></span><div><strong>Wallet</strong><small>Deposits and withdrawals</small></div></div>
          <div><span className={styles.legendIcon}><ArrowDownUp size={18}/></span><div><strong>Swap</strong><small>USDT ⇄ WDC conversions</small></div></div>
          <div><span className={styles.legendIcon}><Coins size={18}/></span><div><strong>Staking</strong><small>Locks, rewards and unlocks</small></div></div>
          <div><span className={styles.legendIcon}><Gift size={18}/></span><div><strong>Referral</strong><small>Network reward activity</small></div></div>
        </section>

        <nav className="dash-mobile-nav gradient-border">
          <Link href="/dashboard"><Home size={19}/><span>Home</span></Link>
          <Link href="/wallet"><WalletCards size={19}/><span>Wallet</span></Link>
          <Link href="/referrals"><Users size={19}/><span>Referral</span></Link>
          <Link href="/staking"><Coins size={19}/><span>Stake</span></Link>
          <a href="#"><UserRound size={19}/><span>Profile</span></a>
        </nav>
      </section>
    </main>
  );
}
