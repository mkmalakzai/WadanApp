"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  Coins,
  Globe2,
  History,
  Home,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Palette,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  Smartphone,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import MobileDock from "../components/MobileDock";
import styles from "./account.module.css";
import { fetchCached, readCached } from "../../lib/client-cache";

type Tab = "overview" | "profile" | "security" | "preferences";

type AccountProfile = {
  appUserId: string;
  displayName: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  kycStatus: string;
  emailConfirmed: boolean;
  wdcBalance: number;
  usdtBalance: number;
};

type AccountWalletSummary = { totalUsd:number; totalStaked:number; };
type AccountReferralSummary = { total?:number; };
type AccountHistorySummary = { rows?:unknown[]; };

export default function AccountPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [saved, setSaved] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [profile, setProfile] = useState<AccountProfile | null>(()=>readCached<{profile:AccountProfile}>("account:me")?.profile ?? null);
  const [profileLoading, setProfileLoading] = useState(()=>!readCached<{profile:AccountProfile}>("account:me")?.profile);
  const [walletStats,setWalletStats]=useState<AccountWalletSummary|null>(()=>readCached<AccountWalletSummary>("wallet:summary"));
  const [referralStats,setReferralStats]=useState<AccountReferralSummary|null>(()=>readCached<AccountReferralSummary>("referrals:overview"));
  const [historyStats,setHistoryStats]=useState<AccountHistorySummary|null>(()=>readCached<AccountHistorySummary>("history"));

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (requested === "overview" || requested === "profile" || requested === "security" || requested === "preferences") {
      setTab(requested);
    }

    void fetchCached<{profile:AccountProfile}>("account:me","/api/account/me")
      .then((data)=>{
        if (data.profile) setProfile(data.profile);
      })
      .catch(()=>undefined)
      .finally(()=>setProfileLoading(false));

    void fetchCached<AccountWalletSummary>("wallet:summary","/api/wallet/summary").then(setWalletStats).catch(()=>undefined);
    void fetchCached<AccountReferralSummary>("referrals:overview","/api/referrals/overview").then(setReferralStats).catch(()=>undefined);
    void fetchCached<AccountHistorySummary>("history","/api/history").then(setHistoryStats).catch(()=>undefined);
  }, []);

  function savePreview() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

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
          <Link href="/wallet"><WalletCards size={18}/> Wallet</Link>
          <Link href="/referrals"><Users size={18}/> Referrals</Link>
          <Link href="/staking"><Coins size={18}/> Staking</Link>
          <Link href="/history"><History size={18}/> History</Link>
        </nav>

        <div className="dash-security">
          <ShieldCheck size={19}/>
          <div><strong>Account center</strong><span>Profile, security and preferences</span></div>
        </div>

        <nav className="dash-nav bottom">
          <Link className="active" href="/account"><UserRound size={18}/> Profile</Link>
          <Link href="/account"><Settings size={18}/> Settings</Link>
        </nav>
      </aside>

      <section className={"dash-main " + styles.main}>
        <header className="dash-topbar">
          <div>
            <p>YOUR ACCOUNT</p>
            <h1>Account Center</h1>
          </div>
          <div className="dash-top-actions">
            <button className="icon-square" aria-label="Notifications"><Bell size={18}/></button>
            <button className="user-chip"><span>{profile?.displayName ? profile.displayName.slice(0,2).toUpperCase() : "W"}</span><div><strong>{profile?.displayName || "—"}</strong><small>Member</small></div></button>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.identity}>
            <div className={styles.avatar}>{(profile?.displayName || "M").slice(0,2).toUpperCase()}</div>
            <div>
              <span>WADAN MEMBER</span>
              <h2>{profile?.displayName || (profileLoading ? "—" : "Member")}</h2>
              <p>Member ID: {profile ? `WDC-${profile.appUserId.slice(0,8).toUpperCase()}` : "—"}</p>
            </div>
          </div>

          <div className={styles.heroStatus}>
            <div><small>Account status</small><strong>{profile?.status || "—"}</strong></div>
            <div><small>Email verification</small><strong>{!profile ? "—" : profile.emailConfirmed ? "Verified" : "Pending"}</strong></div>
            <div><small>Security level</small><strong>Standard</strong></div>
          </div>
        </section>

        <nav className={styles.tabs} aria-label="Account sections">
          <button className={tab==="overview" ? styles.active : ""} onClick={()=>setTab("overview")}><Home size={17}/> Overview</button>
          <button className={tab==="profile" ? styles.active : ""} onClick={()=>setTab("profile")}><UserRound size={17}/> Profile</button>
          <button className={tab==="security" ? styles.active : ""} onClick={()=>setTab("security")}><ShieldCheck size={17}/> Security</button>
          <button className={tab==="preferences" ? styles.active : ""} onClick={()=>setTab("preferences")}><Settings size={17}/> Preferences</button>
        </nav>

        {tab==="overview" && (
          <section className={styles.contentGrid}>
            <article className={styles.panel}>
              <div className={styles.panelHead}>
                <div><span>ACCOUNT OVERVIEW</span><strong>Your profile</strong></div>
                <UserRound size={21}/>
              </div>

              <div className={styles.overviewRows}>
                <div><span>Name</span><strong>{profile?.displayName || "—"}</strong></div>
                <div><span>Email</span><strong>{profileLoading ? "—" : profile?.email || "Not connected"}</strong></div>
                <div><span>Phone</span><strong>{profileLoading ? "—" : profile?.phone || "Not connected"}</strong></div>
                <div><span>Country</span><strong>{profile?.country || "—"}</strong></div>
              </div>

              <button className={styles.textAction} onClick={()=>setTab("profile")}>Edit personal details <ChevronRight size={17}/></button>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHead}>
                <div><span>SECURITY</span><strong>Protection status</strong></div>
                <ShieldCheck size={21}/>
              </div>

              <div className={styles.securityScore}>
                <div className={styles.scoreRing}><strong>2/4</strong><span>setup</span></div>
                <div>
                  <strong>Finish security setup</strong>
                  <p>Add verified contact details and two-factor authentication before live withdrawals are enabled.</p>
                </div>
              </div>

              <button className={styles.textAction} onClick={()=>setTab("security")}>Open security center <ChevronRight size={17}/></button>
            </article>

            <article className={styles.widePanel}>
              <div className={styles.panelHead}>
                <div><span>ACCOUNT SNAPSHOT</span><strong>WADAN activity</strong></div>
                <Coins size={21}/>
              </div>

              <div className={styles.snapshot}>
                <div><small>Wallet balance</small><strong>{walletStats ? walletStats.totalUsd.toLocaleString("en-US",{style:"currency",currency:"USD"}) : "—"}</strong><span>WDC + USDT</span></div>
                <div><small>Total staked</small><strong>{walletStats ? walletStats.totalStaked.toLocaleString("en-US",{maximumFractionDigits:4})+" WDC" : "—"}</strong><span>Active principal</span></div>
                <div><small>Referrals</small><strong>{referralStats?.total ?? "—"}</strong><span>5-level network</span></div>
                <div><small>Activity records</small><strong>{historyStats?.rows ? historyStats.rows.length : "—"}</strong><span>All account activity</span></div>
              </div>
            </article>
          </section>
        )}

        {tab==="profile" && (
          <section className={styles.formPanel}>
            <div className={styles.panelHead}>
              <div><span>PERSONAL DETAILS</span><strong>Edit profile</strong></div>
              <UserRound size={21}/>
            </div>

            <div className={styles.formGrid}>
              <label>
                <span>First name</span>
                <div><UserRound size={17}/><input value={profile?.displayName || ""} readOnly /></div>
              </label>
              <label>
                <span>Last name</span>
                <div><UserRound size={17}/><input placeholder="Last name" /></div>
              </label>
              <label className={styles.full}>
                <span>Email address</span>
                <div><Mail size={17}/><input type="email" value={profile?.email || ""} readOnly /></div>
              </label>
              <label>
                <span>Country / region</span>
                <div><Globe2 size={17}/><input value={profile?.country || ""} readOnly /></div>
              </label>
              <label>
                <span>Mobile number</span>
                <div><Phone size={17}/><input type="tel" value={profile?.phone || ""} readOnly /></div>
              </label>
            </div>

            <div className={styles.actionRow}>
              <button className={styles.primary} type="button" onClick={savePreview}>
                {saved ? <Check size={18}/> : <Save size={18}/>}
                {saved ? "Saved locally" : "Save changes"}
              </button>
              <span>Frontend preview only — backend profile storage comes later.</span>
            </div>
          </section>
        )}

        {tab==="security" && (
          <section className={styles.stack}>
            <article className={styles.panel}>
              <div className={styles.panelHead}>
                <div><span>LOGIN SECURITY</span><strong>Password</strong></div>
                <KeyRound size={21}/>
              </div>
              <div className={styles.securityItem}>
                <div><strong>Password protection</strong><span>Change your password regularly and never reuse it.</span></div>
                <button type="button">Change password</button>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHead}>
                <div><span>TWO-FACTOR AUTH</span><strong>Extra protection</strong></div>
                <Smartphone size={21}/>
              </div>
              <div className={styles.securityItem}>
                <div><strong>Authenticator app</strong><span>Require a second code when signing in or withdrawing.</span></div>
                <button type="button" className={twoFactor ? styles.on : ""} onClick={()=>setTwoFactor(!twoFactor)}>{twoFactor ? "Enabled" : "Enable"}</button>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHead}>
                <div><span>ACTIVE SESSION</span><strong>This device</strong></div>
                <LockKeyhole size={21}/>
              </div>
              <div className={styles.session}>
                <div><span className={styles.deviceIcon}><Smartphone size={19}/></span><div><strong>Current mobile session</strong><small>This device is signed in to your WADAN account.</small></div></div>
                <em>Active</em>
              </div>
            </article>
          </section>
        )}

        {tab==="preferences" && (
          <section className={styles.contentGrid}>
            <article className={styles.panel}>
              <div className={styles.panelHead}>
                <div><span>DISPLAY</span><strong>App preferences</strong></div>
                <Palette size={21}/>
              </div>

              <div className={styles.preferenceRows}>
                <div><span>Theme</span><strong>WADAN Dark</strong></div>
                <div><span>Display currency</span><strong>USD</strong></div>
                <div><span>Language</span><strong>English</strong></div>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHead}>
                <div><span>NOTIFICATIONS</span><strong>Alerts</strong></div>
                <Bell size={21}/>
              </div>

              <div className={styles.toggleRows}>
                <label><div><strong>Security alerts</strong><span>Login and withdrawal warnings</span></div><input type="checkbox" checked={securityAlerts} onChange={()=>setSecurityAlerts(!securityAlerts)}/></label>
                <label><div><strong>Email updates</strong><span>Important account notifications</span></div><input type="checkbox" checked={emailAlerts} onChange={()=>setEmailAlerts(!emailAlerts)}/></label>
              </div>
            </article>

            <article className={styles.widePanel}>
              <div className={styles.panelHead}>
                <div><span>ACCOUNT ACTIONS</span><strong>Session controls</strong></div>
                <Settings size={21}/>
              </div>

              <div className={styles.accountActions}>
                <button type="button" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});window.location.href="/login";}}><LogOut size={18}/> Log out</button>
                <button type="button" disabled>Delete account</button>
              </div>
              <p className={styles.dangerNote}>Account deletion remains disabled until identity and security safeguards are completed.</p>
            </article>
          </section>
        )}

        <MobileDock active="/account" />
      </section>
    </main>
  );
}
