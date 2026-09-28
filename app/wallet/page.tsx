import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  CircleDollarSign,
  Coins,
  Copy,
  Eye,
  History,
  Home,
  LayoutDashboard,
  QrCode,
  Repeat2,
  Settings,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

const walletActivity = [
  ["Deposit","USDT","+$250.00","Completed"],
  ["Swap","USDT → WDC","+25,000 WDC","Completed"],
  ["Withdraw","WDC","-0 WDC","No activity"],
];

export default function WalletPage() {
  return (
    <main className="dash-shell">
      <div className="public-grid-bg" />

      <aside className="dash-sidebar gradient-border">
        <Link href="/" className="public-brand dash-brand">
          <img src="/wadan-mark.svg" alt="WADAN"/>
          <div><strong>WADAN</strong><span>Wadan Coin • WDC</span></div>
        </Link>

        <nav className="dash-nav">
          <Link href="/dashboard"><LayoutDashboard size={18}/> Dashboard</Link>
          <Link className="active" href="/wallet"><WalletCards size={18}/> Wallet</Link>
          <a href="#"><Repeat2 size={18}/> Swap</a>
          <a href="#"><Coins size={18}/> Staking</a>
          <a href="#"><History size={18}/> History</a>
        </nav>

        <div className="dash-security">
          <ShieldCheck size={19}/>
          <div><strong>Wallet protected</strong><span>Withdrawals require account security checks</span></div>
        </div>

        <nav className="dash-nav bottom">
          <a href="#"><UserRound size={18}/> Profile</a>
          <a href="#"><Settings size={18}/> Settings</a>
        </nav>
      </aside>

      <section className="dash-main wallet-main">
        <header className="dash-topbar">
          <div>
            <p>YOUR ASSETS</p>
            <h1>WADAN Wallet</h1>
          </div>
          <div className="dash-top-actions">
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
            <button className="user-chip"><span>MK</span><div><strong>Malakzai</strong><small>Member</small></div></button>
          </div>
        </header>

        <section className="wallet-overview-v2">
          <div className="wallet-total">
            <div>
              <span className="wallet-label"><WalletCards size={15}/> TOTAL WALLET</span>
              <p>Estimated value</p>
              <h2>$0.00</h2>
              <small>Across WDC and USDT</small>
            </div>
            <button className="wallet-eye" aria-label="Toggle balance visibility"><Eye size={19}/></button>
          </div>

          <div className="wallet-balance-grid">
            <article className="wallet-asset-balance wdc-balance">
              <div className="asset-balance-top">
                <span className="asset-symbol">W</span>
                <div><strong>Wadan Coin</strong><small>WDC • BNB Chain</small></div>
              </div>
              <h3>0.00 WDC</h3>
              <div className="asset-balance-foot"><span>$0.00</span><em>$0.0100 / WDC</em></div>
            </article>

            <article className="wallet-asset-balance usdt-balance">
              <div className="asset-balance-top">
                <span className="asset-symbol usdt"><CircleDollarSign size={22}/></span>
                <div><strong>Tether USD</strong><small>USDT • BNB Chain</small></div>
              </div>
              <h3>0.00 USDT</h3>
              <div className="asset-balance-foot"><span>$0.00</span><em>$1.00 / USDT</em></div>
            </article>
          </div>
        </section>

        <section className="wallet-action-section">
          <div className="section-strip">
            <div><span>QUICK TOOLS</span><strong>Manage wallet</strong></div>
            <small>BNB Chain</small>
          </div>
          <div className="wallet-action-dock">
            <button><span><ArrowDownToLine size={22}/></span><strong>Deposit</strong><small>Add funds</small></button>
            <button><span><ArrowUpRight size={22}/></span><strong>Withdraw</strong><small>Send out</small></button>
            <button><span><Repeat2 size={22}/></span><strong>Swap</strong><small>USDT ⇄ WDC</small></button>
          </div>
        </section>

        <section className="wallet-receive-panel">
          <div className="receive-copy">
            <span>RECEIVE FUNDS</span>
            <strong>Your WADAN deposit address</strong>
            <small>BNB Smart Chain • BEP-20</small>
          </div>
          <div className="receive-address">
            <code>0x••••••••••••••••••••••••A7C2</code>
            <div>
              <button aria-label="Copy address"><Copy size={16}/></button>
              <button aria-label="Show QR code"><QrCode size={17}/></button>
            </div>
          </div>
        </section>

        <section className="wallet-grid-v2">
          <article className="wallet-activity-panel">
            <div className="section-strip">
              <div><span>RECENT ACTIVITY</span><strong>Wallet transactions</strong></div>
              <History size={20}/>
            </div>

            <div className="wallet-activity-list">
              {walletActivity.map((r,i)=>(
                <div className="wallet-activity-row" key={r[0]}>
                  <span className="activity-dot">{i+1}</span>
                  <div><strong>{r[0]}</strong><small>{r[1]}</small></div>
                  <div><strong>{r[2]}</strong><small>{r[3]}</small></div>
                </div>
              ))}
            </div>
          </article>

          <article className="wallet-security-v2">
            <div className="section-strip">
              <div><span>SECURITY</span><strong>Wallet protection</strong></div>
              <ShieldCheck size={20}/>
            </div>

            <div className="wallet-security-list">
              <div><span>Account verification</span><strong>Pending</strong></div>
              <div><span>Withdrawal security</span><strong>Enabled</strong></div>
              <div><span>Network</span><strong>BNB Chain</strong></div>
              <div><span>Wallet status</span><strong className="gold-text">Preview</strong></div>
            </div>
          </article>
        </section>

        <nav className="dash-mobile-nav gradient-border">
          <Link href="/dashboard"><Home size={19}/><span>Home</span></Link>
          <Link className="active" href="/wallet"><WalletCards size={19}/><span>Wallet</span></Link>
          <a href="#"><Repeat2 size={19}/><span>Swap</span></a>
          <a href="#"><Coins size={19}/><span>Stake</span></a>
          <a href="#"><UserRound size={19}/><span>Profile</span></a>
        </nav>
      </section>
    </main>
  );
}
