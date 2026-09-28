import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  CircleDollarSign,
  Coins,
  Copy,
  Gift,
  History,
  Home,
  LayoutDashboard,
  Repeat2,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

const recent = [
  ["Deposit","USDT • BNB Chain","+ $250.00","Completed"],
  ["Swap","USDT → WDC","25,000 WDC","Completed"],
  ["Referral","Community reward","+ 500 WDC","Preview"],
];

export default function DashboardPage() {
  return (
    <main className="dash-shell">
      <div className="public-grid-bg" />

      <aside className="dash-sidebar gradient-border">
        <Link href="/" className="public-brand dash-brand">
          <img src="/wadan-mark.svg" alt="WADAN"/>
          <div><strong>WADAN</strong><span>Wadan Coin • WDC</span></div>
        </Link>

        <nav className="dash-nav">
          <Link className="active" href="/dashboard"><LayoutDashboard size={18}/> Dashboard</Link>
          <Link href="/wallet"><WalletCards size={18}/> Wallet</Link>
          <a href="#"><Repeat2 size={18}/> Swap</a>
          <a href="#"><Coins size={18}/> Staking</a>
          <a href="#"><Gift size={18}/> Referrals</a>
          <a href="#"><History size={18}/> History</a>
        </nav>

        <div className="dash-security">
          <ShieldCheck size={19}/>
          <div><strong>Account protected</strong><span>Security controls active</span></div>
        </div>

        <nav className="dash-nav bottom">
          <a href="#"><UserRound size={18}/> Profile</a>
          <a href="#"><Settings size={18}/> Settings</a>
        </nav>
      </aside>

      <section className="dash-main">
        <header className="dash-topbar">
          <div>
            <p>WELCOME BACK</p>
            <h1>WADAN Dashboard</h1>
          </div>
          <div className="dash-top-actions">
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
            <button className="user-chip"><span>MK</span><div><strong>Malakzai</strong><small>Member</small></div></button>
          </div>
        </header>

        <section className="portfolio-pro gradient-border">
          <div className="portfolio-main">
            <div className="dash-hero-label"><Sparkles size={14}/> YOUR WDC PORTFOLIO</div>
            <p className="portfolio-caption">Total portfolio value</p>
            <h2>$0.00</h2>
            <div className="portfolio-change"><span>WDC account</span><strong>0.00 WDC available</strong></div>

            <div className="portfolio-breakdown">
              <div><small>Available</small><strong>0 WDC</strong></div>
              <div><small>Staked</small><strong>0 WDC</strong></div>
              <div><small>Rewards</small><strong>0 WDC</strong></div>
            </div>
          </div>

          <div className="portfolio-visual">
            <div className="portfolio-ring ring-one"/>
            <div className="portfolio-ring ring-two"/>
            <div className="portfolio-coin">
              <img src="/wadan-mark.svg" alt="WDC"/>
            </div>
            <span className="portfolio-network">BNB SMART CHAIN</span>
          </div>
        </section>

        <section className="dashboard-actions">
          <button><span><ArrowDownToLine size={22}/></span><div><strong>Deposit</strong><small>Add USDT or WDC</small></div></button>
          <button><span><ArrowUpRight size={22}/></span><div><strong>Withdraw</strong><small>Send to external wallet</small></div></button>
          <button><span><Repeat2 size={22}/></span><div><strong>Swap</strong><small>USDT ⇄ WDC</small></div></button>
          <button><span><Coins size={22}/></span><div><strong>Stake</strong><small>Start earning WDC</small></div></button>
        </section>

        <section className="dash-metrics">
          <article className="dash-metric gradient-border"><span><Coins size={20}/></span><div><small>WDC Price</small><strong>$0.0100</strong><em>Reference price</em></div></article>
          <article className="dash-metric gradient-border"><span><CircleDollarSign size={20}/></span><div><small>Total Staked</small><strong>0 WDC</strong><em>No active plan</em></div></article>
          <article className="dash-metric gradient-border"><span><Gift size={20}/></span><div><small>Rewards</small><strong>0 WDC</strong><em>Lifetime earnings</em></div></article>
          <article className="dash-metric gradient-border"><span><Users size={20}/></span><div><small>Referrals</small><strong>0</strong><em>Community network</em></div></article>
        </section>

        <section className="dash-two-col">
          <article className="dash-panel gradient-border">
            <div className="dash-panel-head">
              <div><p>STAKING</p><h3>Your staking plans</h3></div>
              <Trophy size={20}/>
            </div>

            <div className="staking-cards">
              <div className="staking-card">
                <div className="staking-badge">6M</div>
                <div><strong>6 Month Plan</strong><span>Medium-term WDC staking</span></div>
                <button>View plan</button>
              </div>
              <div className="staking-card highlighted">
                <div className="staking-badge">12M</div>
                <div><strong>12 Month Plan</strong><span>Long-term WDC staking</span></div>
                <button>View plan</button>
              </div>
            </div>
          </article>

          <article className="dash-panel gradient-border">
            <div className="dash-panel-head">
              <div><p>REFERRAL</p><h3>Invite & grow</h3></div>
              <Gift size={20}/>
            </div>
            <div className="referral-box">
              <span>Your referral code</span>
              <div><strong>WDC-MK7A2</strong><button aria-label="Copy code"><Copy size={15}/></button></div>
              <small>Referral rewards will be defined before public launch.</small>
            </div>
          </article>
        </section>

        <section className="dash-two-col lower">
          <article className="dash-panel gradient-border">
            <div className="dash-panel-head">
              <div><p>RECENT ACTIVITY</p><h3>Transactions</h3></div>
              <History size={20}/>
            </div>
            <div className="dash-activity">
              {recent.map((r,i)=>(
                <div key={r[0]}>
                  <span className="activity-dot">{i+1}</span>
                  <div><strong>{r[0]}</strong><small>{r[1]}</small></div>
                  <div className="activity-right"><strong>{r[2]}</strong><small>{r[3]}</small></div>
                </div>
              ))}
            </div>
          </article>

          <article className="dash-panel gradient-border">
            <div className="dash-panel-head">
              <div><p>ACCOUNT</p><h3>Profile summary</h3></div>
              <UserRound size={20}/>
            </div>
            <div className="profile-summary">
              <div className="profile-large">MK</div>
              <div><strong>Malakzai</strong><span>Verified email pending</span></div>
            </div>
            <div className="profile-lines">
              <div><span>Member ID</span><strong>WDC-000001</strong></div>
              <div><span>Country</span><strong>Afghanistan</strong></div>
              <div><span>Account tier</span><strong>Standard</strong></div>
              <div><span>Status</span><strong className="gold-text">Preview</strong></div>
            </div>
          </article>
        </section>

        <nav className="dash-mobile-nav gradient-border">
          <Link className="active" href="/dashboard"><Home size={19}/><span>Home</span></Link>
          <Link href="/wallet"><WalletCards size={19}/><span>Wallet</span></Link>
          <a href="#"><Repeat2 size={19}/><span>Swap</span></a>
          <a href="#"><Coins size={19}/><span>Stake</span></a>
          <a href="#"><UserRound size={19}/><span>Profile</span></a>
        </nav>
      </section>
    </main>
  );
}
