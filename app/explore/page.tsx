"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeHelp,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Coins,
  Compass,
  ExternalLink,
  Gift,
  Globe2,
  GraduationCap,
  History,
  LayoutDashboard,
  Megaphone,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import MobileDock from "../components/MobileDock";
import { ThemeSwitch } from "../components/WadanTheme";
import { fetchCached, readCached } from "../../lib/client-cache";
import styles from "./explore.module.css";

type Category = "all" | "earn" | "tools" | "discover" | "community";
type Panel = "calculator" | "learn" | "safety" | "support";
type Service = {
  id:string;
  title:string;
  description:string;
  category:Exclude<Category,"all">;
  icon:LucideIcon;
  action?:Panel;
  href?:string;
  soon?:boolean;
};

const services:Service[] = [
  {id:"calculator",title:"WDC Calculator",description:"Convert WDC using the current reference price",category:"tools",icon:Calculator,action:"calculator"},
  {id:"explorer",title:"BNB Chain Explorer",description:"Look up public BEP-20 network transactions",category:"tools",icon:Globe2,href:"https://bscscan.com/"},
  {id:"safety",title:"Security Checklist",description:"Protect your account and verify wallet addresses",category:"tools",icon:ShieldCheck,action:"safety"},
  {id:"guide",title:"WADAN Academy",description:"Start with the WDC ecosystem basics",category:"discover",icon:GraduationCap,action:"learn"},
  {id:"faq",title:"Help & FAQs",description:"Simple answers to common WADAN questions",category:"discover",icon:BadgeHelp,action:"support"},
  {id:"updates",title:"WADAN Announcements",description:"Product news and release notes",category:"discover",icon:Megaphone,soon:true},
  {id:"tasks",title:"Free Earnings",description:"Community tasks and free reward opportunities",category:"earn",icon:Gift,soon:true},
  {id:"missions",title:"Daily Missions",description:"Explore daily ecosystem challenges",category:"earn",icon:Target,soon:true},
  {id:"quests",title:"Community Quests",description:"Special campaigns for active members",category:"earn",icon:Sparkles,soon:true},
  {id:"community",title:"Community Hub",description:"Find upcoming WADAN community activities",category:"community",icon:Users,soon:true},
  {id:"news",title:"Ecosystem News",description:"Important notices from WADAN",category:"community",icon:Megaphone,soon:true},
];

const categories:Record<Category,string> = {
  all:"All services",earn:"Earnings",tools:"Tools",discover:"Learn",community:"Community",
};
const groupTitles:Record<Exclude<Category,"all">,string> = {
  earn:"Earnings & campaigns",tools:"Useful tools",discover:"Learn & support",community:"Community",
};
const panels:Record<Panel,string> = {
  calculator:"WDC Price Calculator",learn:"WADAN Academy",safety:"Security Checklist",support:"Help & FAQs",
};

type WalletSummary = { wdcPrice?:number };

export default function ExplorePage() {
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState<Category>("all");
  const [panel,setPanel]=useState<Panel>("calculator");
  const [amount,setAmount]=useState("1000");
  const [price,setPrice]=useState<number|null>(()=>readCached<WalletSummary>("wallet:summary")?.wdcPrice ?? null);

  useEffect(()=>{
    void fetchCached<WalletSummary>("wallet:summary","/api/wallet/summary")
      .then(result=>setPrice(result.wdcPrice ?? null))
      .catch(()=>undefined);
  },[]);

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return services.filter(item=>
      (category==="all" || item.category===category) &&
      (!q || (item.title+" "+item.description).toLowerCase().includes(q))
    );
  },[category,query]);

  const grouped=(["earn","tools","discover","community"] as const)
    .map(group=>({group,items:filtered.filter(item=>item.category===group)}))
    .filter(group=>group.items.length>0);

  const entered=Number(amount);
  const calculated=price !== null && Number.isFinite(entered) && entered>=0 ? entered*price : null;

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
          <Compass size={19}/>
          <div><strong>Explore WADAN</strong><span>Discover more tools</span></div>
        </div>
        <nav className="dash-nav bottom">
          <Link href="/account"><UserRound size={18}/> Account</Link>
        </nav>
      </aside>

      <section className={"dash-main "+styles.main}>
        <header className={styles.topbar}>
          <div><span className={styles.eyebrow}>WADAN ECOSYSTEM</span><h1>Explore<span>.</span></h1></div>
          <div className={styles.topActions}>
            <ThemeSwitch compact/>
            <Link href="/account" className={styles.profile} aria-label="Open profile"><UserRound size={19}/></Link>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroTag}><Sparkles size={15}/> DISCOVER WADAN</span>
            <h2>One ecosystem.<br/><em>More possibilities.</em></h2>
            <p>Discover new services, practical tools and community opportunities beyond your wallet.</p>
          </div>
        </section>

        <section className={styles.shortcuts}>
          <div className={styles.sectionTitle}><span>YOUR TOOLKIT</span><h2>Quick access</h2></div>
          <div className={styles.quickGrid}>
            <button type="button" onClick={()=>setPanel("calculator")} className={styles.quick}><Calculator size={21}/><strong>Calculator</strong></button>
            <button type="button" onClick={()=>setPanel("learn")} className={styles.quick}><GraduationCap size={21}/><strong>Academy</strong></button>
            <a href="https://bscscan.com/" target="_blank" rel="noopener noreferrer" className={styles.quick}><Globe2 size={21}/><strong>BscScan</strong></a>
            <button type="button" onClick={()=>setPanel("safety")} className={styles.quick}><ShieldCheck size={21}/><strong>Security</strong></button>
            <button type="button" onClick={()=>setPanel("support")} className={styles.quick}><BadgeHelp size={21}/><strong>Help</strong></button>
          </div>
        </section>

        <section className={styles.toolPanel}>
          <div className={styles.toolHead}>
            <div><span>FEATURED TOOL</span><h2>{panels[panel]}</h2></div>
            <span className={styles.available}><CheckCircle2 size={15}/> Available</span>
          </div>

          {panel==="calculator" && (
            <div className={styles.calculator}>
              <label>
                <span>WDC amount</span>
                <div className={styles.calcInput}><input inputMode="decimal" aria-label="Amount in WDC" value={amount} onChange={event=>setAmount(event.target.value.replace(/[^\d.]/g,""))}/><strong>WDC</strong></div>
              </label>
              <div className={styles.calcResult}>
                <span>Estimated value</span>
                <strong>{calculated===null ? "—" : calculated.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:4})}</strong>
                <small>{price===null ? "Checking WDC reference price…" : "1 WDC = "+price.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:4,maximumFractionDigits:6})}</small>
              </div>
              <p>This is an estimate based on the WADAN reference price, not a market quote or a promise of liquidity.</p>
            </div>
          )}

          {panel==="learn" && (
            <div className={styles.guideGrid}>
              <article><span>01</span><strong>What is WDC?</strong><p>Wadan Coin is the planned token for the WADAN ecosystem on BNB Smart Chain.</p></article>
              <article><span>02</span><strong>What is staking?</strong><p>A WDC position locks its principal for a chosen duration; rewards follow the configured plan terms.</p></article>
              <article><span>03</span><strong>Where do rewards go?</strong><p>Completed staking days can be credited to the in-app WDC wallet after the rewards system is enabled.</p></article>
            </div>
          )}

          {panel==="safety" && (
            <div className={styles.guideGrid}>
              <article><ShieldCheck size={21}/><strong>Check the network</strong><p>Always confirm BNB Smart Chain (BEP-20) before sending assets.</p></article>
              <article><ShieldCheck size={21}/><strong>Protect your wallet</strong><p>Never share recovery phrases, private keys or account passwords.</p></article>
              <article><ShieldCheck size={21}/><strong>Verify transactions</strong><p>Use a trusted explorer and check the full destination address and token contract.</p></article>
            </div>
          )}

          {panel==="support" && (
            <div className={styles.guideGrid}>
              <article><BadgeHelp size={21}/><strong>Why is available WDC zero?</strong><p>Staked principal is locked. Earned rewards enter the spendable wallet only when credited to its ledger.</p></article>
              <article><BadgeHelp size={21}/><strong>Is WDC the same as USDT?</strong><p>No. They are separate assets even if both use a BEP-20 receiving address.</p></article>
              <article><BadgeHelp size={21}/><strong>Where is my history?</strong><p>Every financial feature has its own history, with all events also available from the History page.</p></article>
            </div>
          )}
        </section>

        <section className={styles.directory}>
          <div className={styles.sectionTitle}><span>WADAN SERVICES</span><h2>Discover services</h2></div>
          <div className={styles.searchBox}><Search size={19}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search tools, missions, education…" aria-label="Search ecosystem services"/></div>
          <div className={styles.tabs} role="group" aria-label="Explore categories">
            {(Object.keys(categories) as Category[]).map(key=>(
              <button type="button" key={key} onClick={()=>setCategory(key)} className={category===key?styles.activeTab:""} aria-pressed={category===key}>{categories[key]}</button>
            ))}
          </div>
          {grouped.length ? grouped.map(({group,items})=>(
            <section className={styles.group} key={group}>
              <div className={styles.groupTitle}><h3>{groupTitles[group]}</h3><span>{items.length} services</span></div>
              <div className={styles.serviceGrid}>
                {items.map(item=>{
                  const Icon=item.icon;
                  const content=(
                    <>
                      <span className={styles.serviceIcon}><Icon size={22}/></span>
                      <div className={styles.serviceText}><strong>{item.title}</strong><small>{item.description}</small></div>
                      {item.soon ? <em>Coming soon</em> : item.href ? <ExternalLink size={17}/> : <ChevronRight size={17}/>}
                    </>
                  );
                  if(item.soon) return <article key={item.id} className={styles.service+" "+styles.disabled}>{content}</article>;
                  if(item.href) return <a key={item.id} className={styles.service} href={item.href} target="_blank" rel="noopener noreferrer">{content}</a>;
                  return <button type="button" key={item.id} className={styles.service} onClick={()=>setPanel(item.action!)}>{content}</button>;
                })}
              </div>
            </section>
          )) : <div className={styles.empty}><Search size={23}/><strong>No services found</strong><p>Try a different category or search.</p></div>}
        </section>

        <div className={styles.footer}><Compass size={19}/><span>New tools appear here as WADAN grows. Unreleased services are marked Coming soon.</span><ArrowRight size={18}/></div>
        <MobileDock/>
      </section>
    </main>
  );
}
