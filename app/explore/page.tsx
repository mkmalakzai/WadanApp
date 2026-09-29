"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  BookOpen,
  CircleHelp,
  Coins,
  Gift,
  Grid2X2,
  History,
  LayoutDashboard,
  Megaphone,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import MobileDock from "../components/MobileDock";
import styles from "./explore.module.css";

type Category = "all" | "earn" | "account" | "discover";

type Service = {
  title: string;
  subtitle: string;
  category: Exclude<Category,"all">;
  icon: LucideIcon;
  href?: string;
  status?: "New" | "Soon" | "Planned";
};

const services: Service[] = [
  { title:"Free Earnings", subtitle:"Tasks, campaigns and bonus opportunities", category:"earn", icon:Gift, status:"Soon" },
  { title:"Staking", subtitle:"Lock WDC and track projected rewards", category:"earn", icon:Coins, href:"/staking" },
  { title:"Referral", subtitle:"Grow your five-level WADAN network", category:"earn", icon:Users, href:"/referrals" },
  { title:"Rewards", subtitle:"View earning and reward activity", category:"earn", icon:Sparkles, href:"/staking" },

  { title:"KYC Verification", subtitle:"Identity checks and account eligibility", category:"account", icon:BadgeCheck, status:"Soon" },
  { title:"Security Center", subtitle:"Password, 2FA and active sessions", category:"account", icon:ShieldCheck, href:"/account?tab=security" },
  { title:"Account Center", subtitle:"Profile, preferences and account controls", category:"account", icon:UserRound, href:"/account" },

  { title:"WADAN Learn", subtitle:"Simple guides for wallet, WDC and staking", category:"discover", icon:BookOpen, status:"Planned" },
  { title:"Announcements", subtitle:"Product releases and ecosystem updates", category:"discover", icon:Megaphone, status:"Planned" },
  { title:"Support", subtitle:"FAQs and future support tickets", category:"discover", icon:CircleHelp, status:"Planned" },
];

const favorites = [
  { title:"Free Earn", icon:Gift },
  { title:"KYC", icon:BadgeCheck },
  { title:"Security", icon:ShieldCheck, href:"/account?tab=security" },
  { title:"Rewards", icon:Sparkles, href:"/staking" },
  { title:"Referral", icon:Users, href:"/referrals" },
  { title:"Learn", icon:BookOpen },
  { title:"Support", icon:CircleHelp },
];

const labels: Record<Category,string> = {
  all:"All",
  earn:"Earn",
  account:"Account",
  discover:"Discover",
};

export default function ExplorePage(){
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState<Category>("all");

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return services.filter((item)=>{
      const categoryMatch=category==="all" || item.category===category;
      const searchMatch=!q || (item.title+" "+item.subtitle).toLowerCase().includes(q);
      return categoryMatch && searchMatch;
    });
  },[query,category]);

  const grouped=(["earn","account","discover"] as const).map((group)=>({
    group,
    items:filtered.filter((item)=>item.category===group)
  })).filter((group)=>group.items.length>0);

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
          <Link href="/history"><History size={18}/> History</Link>
        </nav>

        <div className="dash-security">
          <Grid2X2 size={19}/>
          <div><strong>Explore WADAN</strong><span>All ecosystem tools</span></div>
        </div>

        <nav className="dash-nav bottom">
          <Link href="/account"><UserRound size={18}/> Profile</Link>
          <Link href="/account"><Settings size={18}/> Settings</Link>
        </nav>
      </aside>

      <section className={"dash-main "+styles.main}>
        <header className="dash-topbar">
          <div>
            <p>WADAN ECOSYSTEM</p>
            <h1>Explore</h1>
          </div>
          <div className="dash-top-actions">
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
            <button className="user-chip"><span>MK</span><div><strong>Malakzai</strong><small>Member</small></div></button>
          </div>
        </header>

        <section className={styles.searchPanel}>
          <div className={styles.searchBox}>
            <Search size={19}/>
            <input
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              placeholder="Search WADAN services"
              aria-label="Search WADAN services"
            />
          </div>
        </section>

        <section className={styles.shortcuts}>
          <div className={styles.sectionHead}>
            <div><span>SHORTCUTS</span><strong>Your favorites</strong></div>
            <Link href="/dashboard">Back to dashboard</Link>
          </div>

          <div className={styles.shortcutGrid}>
            {favorites.map((item)=>{
              const Icon=item.icon;
              const body=(
                <>
                  <span className={styles.shortcutIcon}><Icon size={22}/></span>
                  <strong>{item.title}</strong>
                </>
              );

              return item.href
                ? <Link href={item.href} className={styles.shortcut} key={item.title}>{body}</Link>
                : <button type="button" className={styles.shortcut} key={item.title}>{body}</button>;
            })}

            <button type="button" className={styles.shortcut}>
              <span className={styles.shortcutIcon+" "+styles.moreIcon}><Grid2X2 size={22}/></span>
              <strong>More</strong>
            </button>
          </div>
        </section>

        <section className={styles.directory}>
          <div className={styles.sectionHead}>
            <div><span>ALL SERVICES</span><strong>WADAN services</strong></div>
            <small>{filtered.length} available</small>
          </div>

          <div className={styles.tabs}>
            {(["all","earn","account","discover"] as Category[]).map((item)=>(
              <button
                key={item}
                type="button"
                className={category===item ? styles.activeTab : ""}
                onClick={()=>setCategory(item)}
              >
                {labels[item]}
              </button>
            ))}
          </div>

          {grouped.length>0 ? (
            <div className={styles.groups}>
              {grouped.map(({group,items})=>(
                <section className={styles.group} key={group}>
                  <h2>{group==="earn" ? "Earn" : group==="account" ? "Account & Security" : "Discover"}</h2>

                  <div className={styles.serviceGrid}>
                    {items.map((item)=>{
                      const Icon=item.icon;
                      const content=(
                        <>
                          <span className={styles.serviceIcon}><Icon size={21}/></span>
                          <div className={styles.serviceCopy}>
                            <strong>{item.title}</strong>
                            <span>{item.subtitle}</span>
                          </div>
                          {item.status ? <em>{item.status}</em> : <span className={styles.openDot}/>}
                        </>
                      );

                      return item.href
                        ? <Link className={styles.service} href={item.href} key={item.title}>{content}</Link>
                        : <article className={styles.service+" "+styles.serviceDisabled} key={item.title}>{content}</article>;
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <Search size={27}/>
              <strong>No matching service</strong>
              <span>Try a different search or category.</span>
            </div>
          )}
        </section>

        <section className={styles.footerNote}>
          <ShieldCheck size={19}/>
          <div>
            <strong>WADAN services hub</strong>
            <span>New tools can be added here without making the main dashboard crowded.</span>
          </div>
        </section>

        <MobileDock />
      </section>
    </main>
  );
}
