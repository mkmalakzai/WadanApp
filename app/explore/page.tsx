"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, CircleHelp, Coins,
  Gift, History, LayoutDashboard, LockKeyhole, Megaphone,
  Search, ShieldCheck, Sparkles, UserRound, Users, WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import MobileDock from "../components/MobileDock";
import { ThemeSwitch } from "../components/WadanTheme";
import styles from "./explore.module.css";

type Category = "all" | "earn" | "wallet" | "account" | "discover";
type Service = {
  title:string;
  subtitle:string;
  category:Exclude<Category,"all">;
  icon:LucideIcon;
  href?:string;
  status?:"Coming soon" | "Planned";
};
const services: Service[] = [
  {title:"Staking",subtitle:"WDC plans, positions and earned rewards",category:"earn",icon:Coins,href:"/staking"},
  {title:"Referral Network",subtitle:"Invite friends and view your rewards",category:"earn",icon:Users,href:"/referrals"},
  {title:"Free Earnings",subtitle:"Tasks and community campaigns",category:"earn",icon:Gift,status:"Coming soon"},
  {title:"Deposit",subtitle:"Submit a BEP-20 deposit for review",category:"wallet",icon:WalletCards,href:"/wallet/deposit"},
  {title:"Withdraw",subtitle:"Track your withdrawal requests",category:"wallet",icon:ArrowUpRight,href:"/wallet/withdraw"},
  {title:"Swap",subtitle:"Convert your wallet WDC and USDT",category:"wallet",icon:Sparkles,href:"/wallet/swap"},
  {title:"Transaction History",subtitle:"Your complete activity and statuses",category:"wallet",icon:History,href:"/history"},
  {title:"Account Center",subtitle:"Profile and your account settings",category:"account",icon:UserRound,href:"/account"},
  {title:"Security Center",subtitle:"Review security and session settings",category:"account",icon:ShieldCheck,href:"/account?tab=security"},
  {title:"KYC Verification",subtitle:"Identity verification tools",category:"account",icon:BadgeCheck,status:"Coming soon"},
  {title:"WADAN Learn",subtitle:"Guides and education about WDC",category:"discover",icon:BookOpen,status:"Planned"},
  {title:"Announcements",subtitle:"Official WADAN updates",category:"discover",icon:Megaphone,status:"Planned"},
  {title:"Help Center",subtitle:"Support and frequently asked questions",category:"discover",icon:CircleHelp,status:"Planned"},
];
const categories:Record<Category,string>={all:"All",earn:"Earn",wallet:"Wallet",account:"Account",discover:"Discover"};
const groupNames:Record<Exclude<Category,"all">,string>={
  earn:"Grow & earn",wallet:"Move your assets",account:"Account & protection",discover:"Coming next"
};

export default function ExplorePage(){
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState<Category>("all");

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return services.filter(item=>
      (category==="all"||item.category===category) &&
      (!q||(item.title+" "+item.subtitle).toLowerCase().includes(q))
    );
  },[query,category]);

  const grouped=(["earn","wallet","account","discover"] as const)
    .map(group=>({group,items:filtered.filter(item=>item.category===group)}))
    .filter(group=>group.items.length);
  const liveCount=services.filter(s=>s.href).length;

  return (
    <main className="dash-shell premium-surface explore-premium">
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
          <Link href="/history"><History size={18}/> History</Link>
        </nav>
        <div className="dash-security">
          <Sparkles size={19}/>
          <div><strong>WADAN ecosystem</strong><span>Explore connected services</span></div>
        </div>
        <nav className="dash-nav bottom"><Link href="/account"><UserRound size={18}/> Account</Link></nav>
      </aside>

      <section className={"dash-main "+styles.main}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.topEyebrow}>WADAN ECOSYSTEM</span>
            <h1>Explore<span>.</span></h1>
          </div>
          <div className={styles.topActions}>
            <ThemeSwitch compact/>
            <Link href="/account?tab=preferences" className={styles.avatar} aria-label="Open account preferences"><UserRound size={20}/></Link>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroTag}><Sparkles size={15}/> ONE CONNECTED ECOSYSTEM</span>
            <h2>More than a <em>wallet.</em></h2>
            <p>Stake, grow your community, and manage WDC in one place. Everything important, organized around you.</p>
            <div className={styles.heroFoot}>
              <span className={styles.liveDot}/><strong>{liveCount} accessible tools</strong><span>• BNB Smart Chain</span>
            </div>
          </div>
        </section>

        <div className={styles.sectionTitle}>
          <div><span>START HERE</span><h2>Featured services</h2></div>
        </div>
        <div className={styles.featureGrid}>
          <Link href="/staking" className={styles.feature+" "+styles.featureStake}>
            <span className={styles.featureIcon}><Coins size={24}/></span>
            <div><small>EARN WDC</small><strong>Staking</strong><p>Plans & positions</p></div>
            <ArrowUpRight className={styles.featureArrow} size={20}/>
          </Link>
          <Link href="/referrals" className={styles.feature+" "+styles.featureReferral}>
            <span className={styles.featureIcon}><Users size={24}/></span>
            <div><small>BUILD YOUR NETWORK</small><strong>Referrals</strong><p>Invite & grow</p></div>
            <ArrowUpRight className={styles.featureArrow} size={20}/>
          </Link>
          <Link href="/wallet" className={styles.feature+" "+styles.featureWallet}>
            <span className={styles.featureIcon}><WalletCards size={24}/></span>
            <div><small>YOUR ASSETS</small><strong>WADAN Wallet</strong><p>WDC & USDT</p></div>
            <ArrowUpRight className={styles.featureArrow} size={20}/>
          </Link>
        </div>

        <section className={styles.directory}>
          <div className={styles.sectionTitle}>
            <div><span>SERVICE DIRECTORY</span><h2>Find what you need</h2></div>
            <small>{filtered.length} results</small>
          </div>

          <div className={styles.searchBox}>
            <Search size={20}/>
            <input
              value={query}
              onChange={event=>setQuery(event.target.value)}
              placeholder="Search services, wallets, rewards…"
              aria-label="Search WADAN services"
            />
          </div>

          <nav className={styles.tabs} aria-label="Service categories">
            {(Object.keys(categories) as Category[]).map(item=>(
              <button
                key={item}
                type="button"
                className={category===item ? styles.activeTab : ""}
                onClick={()=>setCategory(item)}
                aria-pressed={category===item}
              >{categories[item]}</button>
            ))}
          </nav>

          {grouped.length ? (
            <div className={styles.groups}>
              {grouped.map(({group,items})=>(
                <section key={group} className={styles.group}>
                  <div className={styles.groupHead}><h3>{groupNames[group]}</h3><span>{items.length} services</span></div>
                  <div className={styles.serviceGrid}>
                    {items.map(item=>{
                      const Icon=item.icon;
                      const inner=(
                        <>
                          <span className={styles.serviceIcon}><Icon size={21}/></span>
                          <div className={styles.serviceCopy}>
                            <strong>{item.title}</strong>
                            <p>{item.subtitle}</p>
                          </div>
                          {item.href ? <ArrowRight size={18} className={styles.serviceArrow}/> : <em>{item.status}</em>}
                        </>
                      );
                      return item.href
                        ? <Link key={item.title} href={item.href} className={styles.service}>{inner}</Link>
                        : <article key={item.title} className={styles.service+" "+styles.serviceDisabled}>{inner}</article>;
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className={styles.empty}><Search size={25}/><strong>No results</strong><p>Try another search term or category.</p></div>
          )}
        </section>

        <div className={styles.bottomNote}>
          <LockKeyhole size={18}/>
          <span>Deposits and withdrawals remain subject to verification and current platform settings.</span>
        </div>
        <MobileDock/>
      </section>
    </main>
  );
}
