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

        <section className="wallet-balance-card gradient-border">
          <div className="wallet-balance-top">
            <div>
              <span className="wallet-label"><WalletCards size={15}/> TOTAL WALLET BALANCE</span>
              <p>Estimated value</p>
              <h2>$0.00</h2>
              <small>0.00 WDC + 0.00 USDT</small>
            </div>
            <button className="wallet-eye" aria-label="Toggle balance visibility"><Eye size={19}/></button>
          </div>

          <div className="wallet-address-box">
            <div>
              <small>WADAN deposit address</small>
              <strong>0x••••••••••••••••••••••••A7C2</strong>
            </div>
            <div className="wallet-address-actions">
              <button aria-label="Copy address"><Copy size={16}/></button>
              <button aria-label="Show QR code"><QrCode size={17}/></button>
            </div>
          </div>
        </section>

        <section className="wallet-actions">
          <button><span><ArrowDownToLine size={22}/></span><div><strong>Deposit</strong><small>Add funds</small></div></button>
          <button><span><ArrowUpRight size={22}/></span><div><strong>Withdraw</strong><small>Send externally</small></div></button>
          <button><span><Repeat2 size={22}/></span><div><strong>Swap</strong><small>USDT ⇄ WDC</small></div></button>
        </section>

        <section className="wallet-assets">
          <div className="wallet-section-head">
            <div><p>ASSETS</p><h3>Your balances</h3></div>
            <span>2 assets</span>
          </div>

          <article className="asset-card gradient-border">
            <div className="asset-logo wdc"><img src="/wadan-mark.svg" alt="WDC"/></div>
            <div className="asset-name"><strong>Wadan Coin</strong><small>WDC • BNB Smart Chain</small></div>
            <div className="asset-price"><small>Price</small><strong>$0.0100</strong></div>
            <div className="asset-balance"><small>Balance</small><strong>0.00 WDC</strong><span>$0.00</span></div>
          </article>

          <article className="asset-card gradient-border">
            <div className="asset-logo usdt"><CircleDollarSign size={24}/></div>
            <div className="asset-name"><strong>Tether USD</strong><small>USDT • BNB Smart Chain</small></div>
            <div className="asset-price"><small>Price</small><strong>$1.00</strong></div>
            <div className="asset-balance"><small>Balance</small><strong>0.00 USDT</strong><span>$0.00</span></div>
          </article>
        </section>

        <section className="wallet-grid">
          <article className="dash-panel gradient-border">
            <div className="dash-panel-head">
              <div><p>RECENT WALLET ACTIVITY</p><h3>Transactions</h3></div>
              <History size={20}/>
            </div>
            <div className="dash-activity wallet-activity">
              {walletActivity.map((r,i)=>(
                <div key={r[0]}>
                  <span className="activity-dot">{i+1}</span>
                  <div><strong>{r[0]}</strong><small>{r[1]}</small></div>
                  <div className="activity-right"><strong>{r[2]}</strong><small>{r[3]}</small></div>
                </div>
              ))}
            </div>
          </article>

          <article className="dash-panel gradient-border wallet-security-panel">
            <div className="dash-panel-head">
              <div><p>SECURITY</p><h3>Wallet protection</h3></div>
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
