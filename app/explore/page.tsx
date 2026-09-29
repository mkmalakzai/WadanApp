import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  BookOpen,
  CircleHelp,
  Coins,
  Gift,
  Grid2X2,
  History,
  Home,
  LayoutDashboard,
  Megaphone,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import styles from "./explore.module.css";

const groups = [
  {
    id:"earn",
    eyebrow:"EARN",
    title:"Grow your WADAN balance",
    items:[
      {id:"earnings",icon:Gift,title:"Free Earnings",text:"Tasks, campaigns and future earning opportunities.",status:"Coming next"},
      {icon:Coins,title:"Staking",text:"Lock WDC and track projected rewards.",href:"/staking",status:"Live preview"},
      {icon:Users,title:"Referral",text:"Build your five-level referral network.",href:"/referrals",status:"Live preview"},
    ]
  },
  {
    id:"account",
    eyebrow:"ACCOUNT",
    title:"Identity & protection",
    items:[
      {id:"kyc",icon:BadgeCheck,title:"KYC Verification",text:"Identity verification and account eligibility.",status:"Coming next"},
      {icon:ShieldCheck,title:"Security Center",text:"Password, 2FA, sessions and security controls.",href:"/account?tab=security",status:"Available"},
      {icon:UserRound,title:"Account Center",text:"Profile, preferences and account settings.",href:"/account",status:"Available"},
    ]
  },
  {
    id:"discover",
    eyebrow:"DISCOVER",
    title:"Learn, updates & support",
    items:[
      {id:"learn",icon:BookOpen,title:"WADAN Learn",text:"Simple guides for WDC, staking and wallet basics.",status:"Planned"},
      {icon:Megaphone,title:"Announcements",text:"Product releases, maintenance and ecosystem updates.",status:"Planned"},
      {id:"support",icon:CircleHelp,title:"Support",text:"Help center, FAQs and future support tickets.",status:"Planned"},
    ]
  },
];

export default function ExplorePage(){
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
          <div><strong>Explore WADAN</strong><span>More tools without cluttering navigation</span></div>
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

        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}><Sparkles size={15}/> MORE FROM WADAN</span>
            <h2>One place for everything beyond the main wallet.</h2>
            <p>Keep the dashboard clean while still giving fast access to earning, verification, security, learning and future ecosystem tools.</p>
          </div>
          <div className={styles.heroMark}><Rocket size={36}/><strong>Explore</strong><span>Expandable ecosystem hub</span></div>
        </section>

        {groups.map((group)=>(
          <section className={styles.section} id={group.id} key={group.id}>
            <div className={styles.sectionHead}>
              <div><span>{group.eyebrow}</span><strong>{group.title}</strong></div>
              <small>{group.items.length} tools</small>
            </div>

            <div className={styles.grid}>
              {group.items.map((item)=>{
                const Icon=item.icon;
                const body=(
                  <>
                    <div className={styles.cardTop}>
                      <span className={styles.icon}><Icon size={22}/></span>
                      <em>{item.status}</em>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <div className={styles.cardFoot}><span>{item.href ? "Open tool" : "Preview module"}</span><strong>→</strong></div>
                  </>
                );

                return item.href ? (
                  <Link id={item.id} className={styles.card} href={item.href} key={item.title}>{body}</Link>
                ) : (
                  <article id={item.id} className={styles.card+" "+styles.planned} key={item.title}>{body}</article>
                );
              })}
            </div>
          </section>
        ))}

        <section className={styles.future}>
          <div><span>FUTURE MODULES</span><strong>Built to expand</strong></div>
          <p>Games, marketplace, governance, community funding and other WADAN services can be added here later without changing the core navigation.</p>
        </section>

        <nav className="dash-mobile-nav gradient-border">
          <Link href="/dashboard"><Home size={19}/><span>Home</span></Link>
          <Link href="/wallet"><WalletCards size={19}/><span>Wallet</span></Link>
          <Link href="/referrals"><Users size={19}/><span>Referral</span></Link>
          <Link href="/staking"><Coins size={19}/><span>Stake</span></Link>
          <Link href="/account"><UserRound size={19}/><span>Profile</span></Link>
        </nav>
      </section>
    </main>
  );
}
