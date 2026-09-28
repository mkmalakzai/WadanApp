import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Coins,
  Crown,
  Github,
  Globe2,
  LockKeyhole,
  MessageCircleMore,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";

const stakers = [
  ["AK","Ahmad K.","4.82M WDC"],["FM","Farid M.","4.31M WDC"],["SA","Sami A.","3.94M WDC"],
  ["HM","Hamid M.","3.50M WDC"],["NA","Naveed A.","3.16M WDC"],["ZR","Zubair R.","2.91M WDC"],
  ["MK","M. Khan","2.68M WDC"],["AR","Arian R.","2.42M WDC"],["YA","Yasir A.","2.18M WDC"],["SK","Sahil K.","1.96M WDC"]
];

const referrers = [
  ["HA","Haroon A.","1,284"],["MR","M. Rahman","1,071"],["FS","Faisal S.","932"],["NA","Noman A.","801"],
  ["IM","Imran M.","744"],["RK","Rafi K.","689"],["AZ","Aziz Z.","625"],["SA","Sami A.","587"],["FM","Farid M.","544"],["AK","Ahmad K.","501"]
];

const roadmap = [
  ["01","Foundation","Token architecture, brand system, core website and user accounts.","active"],
  ["02","WDC Launch","BEP-20 deployment, token visibility and treasury controls.","next"],
  ["03","Staking","6-month and 12-month staking with transparent reward tracking.",""],
  ["04","Swap & Wallet","USDT ⇄ WDC swap, deposits, withdrawals and activity history.",""],
  ["05","Community","Referral economy, funding tools, rankings and member growth.",""],
  ["06","WADAN Ecosystem","Games, marketplace, microtasks and new utility products.",""]
];

function Avatar({ label, index }: { label: string; index: number }) {
  const palettes = [
    ["#f9d77a","#745016"],["#8bd7ff","#254768"],["#b59cff","#4d3d78"],["#83efb2","#25533a"],
    ["#ff9ca9","#6b3340"],["#f6bb7d","#6c4826"],["#9dd7cb","#28554d"],["#dcc58d","#5d5131"],
    ["#a9b9ff","#3f4a7a"],["#f0a8df","#693b61"]
  ];
  const [a,b]=palettes[index % palettes.length];
  return (
    <div className="avatar-art" style={{background:`linear-gradient(145deg,${a},${b})`}}>
      <span>{label}</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="public-shell">
      <div className="public-grid-bg" />
      <header className="public-nav-wrap">
        <nav className="public-nav">
          <Link href="/" className="public-brand">
            <img src="/wadan-mark.svg" alt="WADAN" />
            <div><strong>WADAN</strong><span>Wadan Coin • WDC</span></div>
          </Link>

          <div className="public-links">
            <a href="#about">About</a>
            <a href="#leaders">Leaders</a>
            <a href="#roadmap">Roadmap</a>
            <a href="#token">Token</a>
          </div>

          <div className="public-auth">
            <Link href="/login" className="nav-login">Log in</Link>
            <Link href="/signup" className="nav-signup">Create account <ArrowRight size={15}/></Link>
          </div>
        </nav>
      </header>

      <section className="public-hero">
        <div className="hero-copy-block">
          <div className="hero-kicker"><Sparkles size={14}/> BUILT FOR THE NEXT WADAN ECONOMY</div>
          <h1>One coin.<br/><span>One ecosystem.</span><br/>More utility.</h1>
          <p>WADAN is a digital ecosystem built around WDC — bringing staking, swap, wallet tools, community rewards and future utility products into one platform.</p>
          <div className="hero-cta-row">
            <Link href="/signup" className="gold-cta">Join WADAN <ArrowRight size={17}/></Link>
            <a href="#roadmap" className="glass-cta">Explore roadmap</a>
          </div>

          <div className="hero-trust-row">
            <span><ShieldCheck size={15}/> BNB Smart Chain</span>
            <span><LockKeyhole size={15}/> Security focused</span>
            <span><Zap size={15}/> Utility first</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-orbit orbit-a"/>
          <div className="hero-orbit orbit-b"/>
          <div className="hero-orbit orbit-c"/>
          <div className="hero-logo-core">
            <img src="/wadan-mark.svg" alt="" />
          </div>
          <span className="floating-tag tag-a"><Coins size={14}/> WDC</span>
          <span className="floating-tag tag-b"><Trophy size={14}/> Staking</span>
          <span className="floating-tag tag-c"><Users size={14}/> Community</span>
        </div>
      </section>

      <section id="about" className="public-stats">
        <article><span className="stat-icon"><Coins size={20}/></span><div><small>Total Supply</small><strong>1,000,000,000</strong><em>WDC</em></div></article>
        <article><span className="stat-icon"><WalletCards size={20}/></span><div><small>Network</small><strong>BNB Chain</strong><em>BEP-20</em></div></article>
        <article><span className="stat-icon"><Crown size={20}/></span><div><small>Staking Plans</small><strong>6M + 12M</strong><em>Planned</em></div></article>
        <article><span className="stat-icon"><Rocket size={20}/></span><div><small>Build Stage</small><strong>Foundation</strong><em>Phase 01</em></div></article>
      </section>

      <section className="public-section intro-section">
        <div className="section-heading">
          <p>PROJECT VISION</p>
          <h2>More than a token.</h2>
          <span>WDC is designed as the core asset of a broader digital platform instead of a single-purpose coin.</span>
        </div>

        <div className="vision-grid">
          <article className="vision-card gradient-border"><Coins size={24}/><h3>Stake</h3><p>Lock WDC in structured plans and track rewards directly inside your account.</p></article>
          <article className="vision-card gradient-border"><Zap size={24}/><h3>Swap</h3><p>Move between USDT and WDC through a simple platform-native exchange flow.</p></article>
          <article className="vision-card gradient-border"><Users size={24}/><h3>Community</h3><p>Leaderboards, referrals and community utility designed to grow with the ecosystem.</p></article>
          <article className="vision-card gradient-border"><Globe2 size={24}/><h3>Expand</h3><p>Future modules can include games, marketplace, funding and microtask products.</p></article>
        </div>
      </section>

      <section id="leaders" className="public-section leaderboard-section">
        <div className="section-heading center">
          <p>COMMUNITY RANKINGS</p>
          <h2>People powering WADAN.</h2>
          <span>Preview leaderboards for staking and community referrals.</span>
        </div>

        <div className="leaderboards-grid">
          <article className="leaderboard-card gradient-border">
            <div className="leaderboard-head">
              <div><span className="board-icon"><Trophy size={20}/></span><div><small>TOP 10</small><h3>Stakers</h3></div></div>
              <span className="board-chip">By WDC</span>
            </div>
            <div className="leader-list">
              {stakers.map((row,i)=>(
                <div className="leader-row" key={row[1]}>
                  <span className={`rank-num ${i<3?"top-rank":""}`}>{String(i+1).padStart(2,"0")}</span>
                  <Avatar label={row[0]} index={i}/>
                  <div className="leader-name"><strong>{row[1]}</strong><small>WADAN member</small></div>
                  <strong className="leader-value">{row[2]}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="leaderboard-card gradient-border">
            <div className="leaderboard-head">
              <div><span className="board-icon"><Users size={20}/></span><div><small>TOP 10</small><h3>Referrers</h3></div></div>
              <span className="board-chip">By referrals</span>
            </div>
            <div className="leader-list">
              {referrers.map((row,i)=>(
                <div className="leader-row" key={row[1]}>
                  <span className={`rank-num ${i<3?"top-rank":""}`}>{String(i+1).padStart(2,"0")}</span>
                  <Avatar label={row[0]} index={i+3}/>
                  <div className="leader-name"><strong>{row[1]}</strong><small>Community builder</small></div>
                  <strong className="leader-value">{row[2]}</strong>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="roadmap" className="public-section roadmap-section">
        <div className="section-heading center">
          <p>ANIMATED ROADMAP</p>
          <h2>Where WADAN is going.</h2>
          <span>A staged path from the foundation to a broader utility ecosystem.</span>
        </div>

        <div className="roadmap-track">
          <div className="roadmap-line"><span/></div>
          {roadmap.map((item,i)=>(
            <article className={`roadmap-step ${item[4]}`} key={item[0]}>
              <div className="roadmap-node">{item[0]}</div>
              <div className="roadmap-card gradient-border">
                <div className="roadmap-top"><small>PHASE {item[0]}</small>{item[4]==="active"&&<span><CheckCircle2 size={13}/> Active</span>}</div>
                <h3>{item[1]}</h3>
                <p>{item[2]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="token" className="public-section token-section">
        <div className="token-panel gradient-border">
          <div className="token-identity">
            <img src="/wadan-mark.svg" alt="Wadan Coin"/>
            <div><small>WADAN COIN</small><h2>WDC</h2><p>The native asset powering the WADAN ecosystem.</p></div>
          </div>

          <div className="token-details">
            <div><small>Name</small><strong>Wadan Coin</strong></div>
            <div><small>Symbol</small><strong>WDC</strong></div>
            <div><small>Network</small><strong>BNB Smart Chain</strong></div>
            <div><small>Standard</small><strong>BEP-20</strong></div>
            <div><small>Total Supply</small><strong>1B WDC</strong></div>
            <div><small>Contract</small><strong>Coming after deployment</strong></div>
          </div>
        </div>
      </section>

      <section className="public-section social-section">
        <div className="section-heading center">
          <p>WADAN COMMUNITY</p>
          <h2>Stay connected.</h2>
          <span>Official links will be activated as each channel is launched.</span>
        </div>

        <div className="social-grid">
          <a href="#" className="social-card gradient-border"><MessageCircleMore/><div><strong>Telegram</strong><small>Community & updates</small></div><ArrowRight size={16}/></a>
          <a href="#" className="social-card gradient-border"><Github/><div><strong>GitHub</strong><small>Development</small></div><ArrowRight size={16}/></a>
          <a href="#" className="social-card gradient-border"><BookOpen/><div><strong>Docs</strong><small>Project documentation</small></div><ArrowRight size={16}/></a>
          <a href="#" className="social-card gradient-border"><Globe2/><div><strong>Website</strong><small>Official WADAN portal</small></div><ArrowRight size={16}/></a>
        </div>
      </section>

      <section className="final-cta">
        <div>
          <p>READY FOR WADAN?</p>
          <h2>Create your account and enter the ecosystem.</h2>
        </div>
        <Link href="/signup" className="gold-cta">Create account <ArrowRight size={17}/></Link>
      </section>

      <footer className="public-footer">
        <Link href="/" className="public-brand">
          <img src="/wadan-mark.svg" alt="WADAN"/>
          <div><strong>WADAN</strong><span>Wadan Coin • WDC</span></div>
        </Link>
        <p>WADAN preview website • Token contract and live financial features are not active yet.</p>
      </footer>
    </main>
  );
}
