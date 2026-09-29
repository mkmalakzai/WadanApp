import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Coins,
  Gift,
  Grid2X2,
  History,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import MobileDock from "../components/MobileDock";
import styles from "./explore.module.css";

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
          <div><strong>Explore WADAN</strong><span>Extra ecosystem tools</span></div>
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
          <div className={styles.heroIcon}><Sparkles size={23}/></div>
          <div className={styles.heroCopy}>
            <span>MORE FROM WADAN</span>
            <h2>Tools beyond the main wallet.</h2>
            <p>Earn, verify, secure, learn and access future WADAN services without crowding the core app.</p>
          </div>
          <div className={styles.heroMeta}>
            <div><strong>9</strong><span>Tools</span></div>
            <div><strong>3</strong><span>Groups</span></div>
          </div>
        </section>

        <section className={styles.quickStrip}>
          <a href="#earn"><Gift size={17}/><span>Earn</span></a>
          <a href="#identity"><BadgeCheck size={17}/><span>KYC</span></a>
          <Link href="/account?tab=security"><ShieldCheck size={17}/><span>Security</span></Link>
          <a href="#learn"><BookOpen size={17}/><span>Learn</span></a>
        </section>

        <section className={styles.featured}>
          <div className={styles.sectionHead}>
            <div><span>FEATURED</span><strong>Next WADAN modules</strong></div>
            <small>Preview</small>
          </div>

          <div className={styles.featuredGrid}>
            <article>
              <div className={styles.featureIcon}><Gift size={20}/></div>
              <div><small>EARN</small><strong>Free Earnings</strong><p>Tasks, campaigns and bonus opportunities.</p></div>
              <em>Coming soon</em>
            </article>

            <article>
              <div className={styles.featureIcon}><BadgeCheck size={20}/></div>
              <div><small>VERIFY</small><strong>KYC Verification</strong><p>Identity checks for protected account features.</p></div>
              <em>Coming soon</em>
            </article>
          </div>
        </section>

        <section className={styles.groups}>
          <article className={styles.group} id="earn">
            <header><div><span>EARN</span><strong>Earnings</strong></div><small>3</small></header>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span className={styles.rowIcon}><Gift size={18}/></span>
                <div><strong>Free Earnings</strong><small>Tasks and earning campaigns</small></div>
                <em>Soon</em>
                <ChevronRight size={17}/>
              </div>
              <Link className={styles.row} href="/staking">
                <span className={styles.rowIcon}><Coins size={18}/></span>
                <div><strong>Staking</strong><small>Lock WDC and track rewards</small></div>
                <em>Preview</em>
                <ChevronRight size={17}/>
              </Link>
              <Link className={styles.row} href="/referrals">
                <span className={styles.rowIcon}><Users size={18}/></span>
                <div><strong>Referral</strong><small>Five-level network rewards</small></div>
                <em>Preview</em>
                <ChevronRight size={17}/>
              </Link>
            </div>
          </article>

          <article className={styles.group} id="identity">
            <header><div><span>ACCOUNT</span><strong>Identity & protection</strong></div><small>3</small></header>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span className={styles.rowIcon}><BadgeCheck size={18}/></span>
                <div><strong>KYC Verification</strong><small>Identity and eligibility checks</small></div>
                <em>Soon</em>
                <ChevronRight size={17}/>
              </div>
              <Link className={styles.row} href="/account?tab=security">
                <span className={styles.rowIcon}><ShieldCheck size={18}/></span>
                <div><strong>Security Center</strong><small>Password, 2FA and sessions</small></div>
                <em>Open</em>
                <ChevronRight size={17}/>
              </Link>
              <Link className={styles.row} href="/account">
                <span className={styles.rowIcon}><UserRound size={18}/></span>
                <div><strong>Account Center</strong><small>Profile and preferences</small></div>
                <em>Open</em>
                <ChevronRight size={17}/>
              </Link>
            </div>
          </article>

          <article className={styles.group} id="learn">
            <header><div><span>DISCOVER</span><strong>Learn & support</strong></div><small>3</small></header>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span className={styles.rowIcon}><BookOpen size={18}/></span>
                <div><strong>WADAN Learn</strong><small>Guides for WDC, wallet and staking</small></div>
                <em>Planned</em>
                <ChevronRight size={17}/>
              </div>
              <div className={styles.row}>
                <span className={styles.rowIcon}><Megaphone size={18}/></span>
                <div><strong>Announcements</strong><small>Releases and ecosystem updates</small></div>
                <em>Planned</em>
                <ChevronRight size={17}/>
              </div>
              <div className={styles.row}>
                <span className={styles.rowIcon}><CircleHelp size={18}/></span>
                <div><strong>Support</strong><small>FAQs and future support tickets</small></div>
                <em>Planned</em>
                <ChevronRight size={17}/>
              </div>
            </div>
          </article>
        </section>

        <section className={styles.future}>
          <Grid2X2 size={19}/>
          <div><strong>Built to expand</strong><span>Games, marketplace, governance and more can be added here later.</span></div>
        </section>

        <MobileDock />
      </section>
    </main>
  );
}
