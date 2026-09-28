import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Coins,
  CreditCard,
  History,
  Home,
  LayoutDashboard,
  Repeat2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  WalletCards,
  Zap,
} from "lucide-react";

const activities = [
  { icon: ArrowDownToLine, title: "Deposit", subtitle: "USDT • BNB Smart Chain", amount: "+ $250.00", time: "Preview" },
  { icon: Repeat2, title: "Swap", subtitle: "USDT → WDC", amount: "25,000 WDC", time: "Preview" },
  { icon: Coins, title: "Stake", subtitle: "6 month plan", amount: "0 WDC", time: "Not active" },
];

export default function HomePage() {
  return (
    <main className="dashboard-shell">
      <div className="bg-grid" />
      <div className="glow glow-a" />
      <div className="glow glow-b" />

      <div className="dashboard-layout">
        <aside className="sidebar glass-panel">
          <Link href="/" className="brand-block">
            <div className="brand-symbol"><span>W</span></div>
            <div>
              <strong>WADAN</strong>
              <small>Wadan Coin • WDC</small>
            </div>
          </Link>

          <nav className="side-nav">
            <a className="active" href="#"><LayoutDashboard size={19} /><span>Dashboard</span></a>
            <a href="#"><WalletCards size={19} /><span>Wallet</span></a>
            <a href="#"><Repeat2 size={19} /><span>Swap</span></a>
            <a href="#"><Coins size={19} /><span>Staking</span></a>
            <a href="#"><History size={19} /><span>History</span></a>
          </nav>

          <div className="side-spacer" />

          <div className="security-mini">
            <div className="security-icon"><ShieldCheck size={18} /></div>
            <div>
              <strong>Security first</strong>
              <p>Protected account controls and activity monitoring.</p>
            </div>
          </div>

          <nav className="side-nav side-nav-bottom">
            <a href="#"><UserRound size={19} /><span>Profile</span></a>
          </nav>
        </aside>

        <section className="main-area">
          <header className="main-header">
            <div className="mobile-brand">
              <div className="brand-symbol small"><span>W</span></div>
              <strong>WADAN</strong>
            </div>

            <div>
              <p className="overline">WADAN ECOSYSTEM</p>
              <h1>Dashboard</h1>
            </div>

            <div className="header-actions">
              <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button>
              <Link href="/login" className="button button-ghost">Log in</Link>
              <Link href="/signup" className="button button-primary">Create account <ArrowUpRight size={16} /></Link>
            </div>
          </header>

          <section className="hero-card glass-panel reveal delay-1">
            <div className="hero-content">
              <div className="status-badge"><Sparkles size={14} /> WDC PLATFORM PREVIEW</div>
              <h2>Build wealth inside the <span>WADAN</span> ecosystem.</h2>
              <p>One premium dashboard for your WDC balance, staking, swaps, deposits, withdrawals and transaction history.</p>
              <div className="hero-buttons">
                <Link href="/signup" className="button button-primary button-large">Get started <ChevronRight size={17} /></Link>
                <a href="#overview" className="button button-ghost button-large">Explore dashboard</a>
              </div>
            </div>

            <div className="hero-coin-wrap" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="premium-coin">
                <span className="coin-shine" />
                <strong>W</strong>
                <small>WDC</small>
              </div>
            </div>
          </section>

          <section id="overview" className="stats-grid reveal delay-2">
            <article className="metric-card glass-panel">
              <div className="metric-head">
                <span className="metric-icon gold"><WalletCards size={19} /></span>
                <span className="metric-trend neutral">Portfolio</span>
              </div>
              <p>Total Balance</p>
              <h3>$0.00</h3>
              <small>0.00 WDC available</small>
            </article>

            <article className="metric-card glass-panel">
              <div className="metric-head">
                <span className="metric-icon violet"><Coins size={19} /></span>
                <span className="metric-trend positive"><TrendingUp size={13} /> Live</span>
              </div>
              <p>WDC Price</p>
              <h3>$0.0100</h3>
              <small>Reference platform price</small>
            </article>

            <article className="metric-card glass-panel">
              <div className="metric-head">
                <span className="metric-icon cyan"><Zap size={19} /></span>
                <span className="metric-trend neutral">Staking</span>
              </div>
              <p>Total Staked</p>
              <h3>0 WDC</h3>
              <small>No active plan yet</small>
            </article>

            <article className="metric-card glass-panel">
              <div className="metric-head">
                <span className="metric-icon green"><CreditCard size={19} /></span>
                <span className="metric-trend neutral">Rewards</span>
              </div>
              <p>Earned</p>
              <h3>0 WDC</h3>
              <small>Rewards will appear here</small>
            </article>
          </section>

          <section className="content-grid reveal delay-3">
            <article className="panel-card glass-panel quick-panel">
              <div className="panel-title">
                <div>
                  <p className="overline">QUICK ACTIONS</p>
                  <h3>Manage your assets</h3>
                </div>
                <span className="soft-chip">BNB Chain</span>
              </div>

              <div className="action-grid">
                <button><span className="action-icon"><ArrowDownToLine size={21} /></span><strong>Deposit</strong><small>Add funds</small></button>
                <button><span className="action-icon"><ArrowUpRight size={21} /></span><strong>Withdraw</strong><small>Send funds</small></button>
                <button><span className="action-icon"><Repeat2 size={21} /></span><strong>Swap</strong><small>USDT ↔ WDC</small></button>
                <button><span className="action-icon"><Coins size={21} /></span><strong>Stake</strong><small>Earn WDC</small></button>
              </div>
            </article>

            <article className="panel-card glass-panel account-panel">
              <div className="panel-title">
                <div>
                  <p className="overline">ACCOUNT</p>
                  <h3>Your profile</h3>
                </div>
                <UserRound size={20} />
              </div>

              <div className="profile-preview">
                <div className="profile-avatar">W</div>
                <div>
                  <strong>Guest user</strong>
                  <small>Sign in to unlock your account</small>
                </div>
              </div>

              <div className="info-row"><span>Account status</span><strong className="status-text">Not signed in</strong></div>
              <div className="info-row"><span>Verification</span><strong>Pending</strong></div>
              <div className="info-row"><span>Network</span><strong>BNB Smart Chain</strong></div>

              <Link className="full-link" href="/login">Log in to your account <ChevronRight size={16} /></Link>
            </article>
          </section>

          <section className="content-grid bottom-grid reveal delay-4">
            <article className="panel-card glass-panel">
              <div className="panel-title">
                <div>
                  <p className="overline">STAKING</p>
                  <h3>WDC staking plans</h3>
                </div>
                <Coins size={20} />
              </div>

              <div className="staking-list">
                <div className="staking-item">
                  <span className="plan-badge">6M</span>
                  <div><strong>6 Month Plan</strong><small>Medium-term WDC staking</small></div>
                  <span className="coming">Coming soon</span>
                </div>
                <div className="staking-item featured">
                  <span className="plan-badge">12M</span>
                  <div><strong>12 Month Plan</strong><small>Long-term WDC staking</small></div>
                  <span className="coming">Coming soon</span>
                </div>
              </div>
            </article>

            <article className="panel-card glass-panel">
              <div className="panel-title">
                <div>
                  <p className="overline">RECENT ACTIVITY</p>
                  <h3>Transaction history</h3>
                </div>
                <History size={20} />
              </div>

              <div className="activity-list">
                {activities.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div className="activity-item" key={item.title}>
                      <span className="activity-icon"><Icon size={18} /></span>
                      <div><strong>{item.title}</strong><small>{item.subtitle}</small></div>
                      <div className="activity-amount"><strong>{item.amount}</strong><small>{item.time}</small></div>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          <footer className="site-footer">
            <div><strong>WADAN</strong><span>WDC • Digital Ecosystem</span></div>
            <p>Preview environment • Blockchain features will be connected after testing.</p>
          </footer>
        </section>
      </div>

      <nav className="mobile-bottom-nav glass-panel">
        <a className="active" href="#"><Home size={19} /><span>Home</span></a>
        <a href="#"><WalletCards size={19} /><span>Wallet</span></a>
        <a href="#"><Repeat2 size={19} /><span>Swap</span></a>
        <a href="#"><Coins size={19} /><span>Stake</span></a>
        <Link href="/login"><UserRound size={19} /><span>Account</span></Link>
      </nav>
    </main>
  );
}
