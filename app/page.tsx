const ArrowIcon = ({ direction = "up" }: { direction?: "up" | "down" | "swap" }) => {
  if (direction === "swap") return <span aria-hidden="true">⇄</span>;
  return <span aria-hidden="true">{direction === "up" ? "↗" : "↙"}</span>;
};

export default function Home() {
  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="app-frame">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">W</div>
            <div>
              <strong>WADAN</strong>
              <span>Wadan Coin • WDC</span>
            </div>
          </div>

          <div className="top-actions">
            <div className="network-pill">
              <span className="network-dot" />
              BNB Smart Chain
            </div>
            <button className="wallet-button">Connect Wallet</button>
          </div>
        </header>

        <section className="welcome-row">
          <div>
            <p className="eyebrow">WADAN ECOSYSTEM</p>
            <h1>Your digital assets, in one place.</h1>
            <p className="hero-copy">
              Stake, swap and manage WDC through one clean experience built for the WADAN ecosystem.
            </p>
          </div>
          <div className="live-chip"><span /> Platform Preview</div>
        </section>

        <section className="dashboard-grid">
          <article className="card balance-card">
            <div className="card-heading">
              <div>
                <p className="card-label">Total Portfolio</p>
                <h2>$0.00</h2>
                <p className="muted">0.00 WDC available</p>
              </div>
              <div className="coin-orbit">
                <div className="coin-core">W</div>
              </div>
            </div>

            <div className="quick-actions">
              <button><span><ArrowIcon direction="down" /></span>Deposit</button>
              <button><span><ArrowIcon direction="swap" /></span>Swap</button>
              <button><span>◇</span>Stake</button>
              <button><span><ArrowIcon direction="up" /></span>Withdraw</button>
            </div>
          </article>

          <article className="card price-card">
            <div className="price-top">
              <div className="mini-coin">W</div>
              <div>
                <p className="card-label">WDC Price</p>
                <h3>$0.0100</h3>
              </div>
            </div>
            <div className="stat-line">
              <span>24h change</span>
              <strong>—</strong>
            </div>
            <div className="stat-line">
              <span>Network</span>
              <strong>BNB Chain</strong>
            </div>
            <div className="stat-line">
              <span>Status</span>
              <strong className="gold-text">Building</strong>
            </div>
          </article>

          <article className="card stake-card">
            <div className="section-title">
              <div>
                <p className="card-label">WDC Staking</p>
                <h3>Grow your WDC</h3>
              </div>
              <button className="text-button">View plans →</button>
            </div>

            <div className="plan-grid">
              <div className="plan">
                <span className="plan-icon">6M</span>
                <div><strong>6 Months</strong><small>Flexible starter plan</small></div>
                <span className="soon">Soon</span>
              </div>
              <div className="plan featured-plan">
                <span className="plan-icon">12M</span>
                <div><strong>12 Months</strong><small>Long-term staking</small></div>
                <span className="soon">Soon</span>
              </div>
            </div>
          </article>

          <article className="card activity-card">
            <div className="section-title">
              <div>
                <p className="card-label">Recent Activity</p>
                <h3>Transactions</h3>
              </div>
              <button className="dots" aria-label="More options">•••</button>
            </div>
            <div className="empty-state">
              <div className="empty-icon">↗</div>
              <strong>No activity yet</strong>
              <p>Your deposits, swaps, stakes and withdrawals will appear here.</p>
            </div>
          </article>
        </section>

        <nav className="mobile-nav" aria-label="Primary">
          <a className="active" href="#"><span>⌂</span>Home</a>
          <a href="#"><span>◇</span>Stake</a>
          <a href="#"><span>⇄</span>Swap</a>
          <a href="#"><span>◫</span>Wallet</a>
        </nav>

        <footer>
          <span>WADAN • WDC</span>
          <span>Preview build • Not connected to mainnet</span>
        </footer>
      </div>
    </main>
  );
}
