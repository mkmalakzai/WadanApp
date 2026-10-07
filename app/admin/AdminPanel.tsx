"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  BadgeDollarSign,
  Bell,
  CircleDollarSign,
  Coins,
  Database,
  LayoutDashboard,
  LockKeyhole,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import type { AdminDeposit, AdminOverview, AdminSettings, AdminStakingPlan, AdminUser, AdminWithdrawal } from "../../lib/backend/admin";
import styles from "./admin.module.css";

type Tab =
  | "overview"
  | "users"
  | "deposits"
  | "withdrawals"
  | "staking"
  | "settings";

const nav = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "users" as const, label: "Users", icon: Users },
  { id: "deposits" as const, label: "Deposits", icon: CircleDollarSign },
  { id: "withdrawals" as const, label: "Withdrawals", icon: WalletCards },
  { id: "staking" as const, label: "Staking", icon: Coins },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

function format(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

export default function AdminPanel({
  initialOverview,
}: {
  initialOverview: AdminOverview;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState(initialOverview);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [plans, setPlans] = useState<AdminStakingPlan[]>([]);
  const [settingsData, setSettingsData] = useState<AdminSettings | null>(null);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [moduleMessage, setModuleMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setModuleMessage("");
    if (tab === "users") void loadUsers();
    if (tab === "deposits") void loadDeposits();
    if (tab === "withdrawals") void loadWithdrawals();
    if (tab === "staking") void loadPlans();
    if (tab === "settings") void loadSettings();
  }, [tab]);

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await response.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadDeposits() {
    setModuleLoading(true);
    try {
      const response = await fetch("/api/admin/deposits", { cache: "no-store" });
      const data = await response.json();
      setDeposits(Array.isArray(data.deposits) ? data.deposits : []);
    } finally {
      setModuleLoading(false);
    }
  }

  async function actDeposit(id: string, action: "confirm" | "reject") {
    setModuleMessage("");
    const response = await fetch("/api/admin/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await response.json();
    if (!response.ok) {
      setModuleMessage(data.error || "Deposit action failed.");
      return;
    }
    setModuleMessage("Deposit updated.");
    await Promise.all([loadDeposits(), refreshOverview()]);
  }

  async function loadWithdrawals() {
    setModuleLoading(true);
    try {
      const response = await fetch("/api/admin/withdrawals", { cache: "no-store" });
      const data = await response.json();
      setWithdrawals(Array.isArray(data.withdrawals) ? data.withdrawals : []);
    } finally {
      setModuleLoading(false);
    }
  }

  async function actWithdrawal(id: string, action: "approve" | "reject" | "sent") {
    let txHash = "";
    if (action === "sent") {
      txHash = window.prompt("Enter blockchain transaction hash") || "";
      if (!txHash) return;
    }

    setModuleMessage("");
    const response = await fetch("/api/admin/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, txHash }),
    });
    const data = await response.json();
    if (!response.ok) {
      setModuleMessage(data.error || "Withdrawal action failed.");
      return;
    }
    setModuleMessage("Withdrawal updated.");
    await Promise.all([loadWithdrawals(), refreshOverview()]);
  }

  async function loadPlans() {
    setModuleLoading(true);
    try {
      const response = await fetch("/api/admin/staking-plans", { cache: "no-store" });
      const data = await response.json();
      setPlans(Array.isArray(data.plans) ? data.plans : []);
    } finally {
      setModuleLoading(false);
    }
  }

  async function savePlan(plan: AdminStakingPlan) {
    const response = await fetch("/api/admin/staking-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: plan.id, dailyRate: plan.dailyRate, enabled: plan.enabled }),
    });
    const data = await response.json();
    setModuleMessage(response.ok ? "Staking plan saved." : data.error || "Unable to save plan.");
    if (response.ok) await loadPlans();
  }

  async function loadSettings() {
    setModuleLoading(true);
    try {
      const response = await fetch("/api/admin/settings", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) setSettingsData(data.settings);
    } finally {
      setModuleLoading(false);
    }
  }

  async function saveSetting(key: keyof AdminSettings, value: string | number | boolean) {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    const data = await response.json();
    setModuleMessage(response.ok ? "Setting saved." : data.error || "Unable to save setting.");
    if (response.ok) await loadSettings();
  }

  async function refreshOverview() {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      if (response.ok) {
        setOverview(await response.json());
      }
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src="/wadan-mark.svg" alt="WADAN" />
          <div>
            <strong>WADAN ADMIN</strong>
            <span>Control Center</span>
          </div>
        </div>

        <nav className={styles.nav+" "+styles.desktopNav}>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={tab === item.id ? styles.active : ""}
                onClick={() => setTab(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.guard}>
          <ShieldCheck size={19} />
          <div>
            <strong>Admin only</strong>
            <span>Owner access</span>
          </div>
        </div>
      </aside>

      <section className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p>WADAN OPERATIONS</p>
            <h1>{nav.find((item) => item.id === tab)?.label}</h1>
          </div>

          <div className={styles.topActions}>
            <button type="button" aria-label="Search"><Search size={18} /></button>
            <button type="button" aria-label="Settings" onClick={() => setTab("settings")}><Settings size={18} /></button>
            <button type="button" aria-label="Notifications"><Bell size={18} /></button>
            <div className={styles.adminChip}>
              <span>AD</span>
              <div><strong>Administrator</strong><small>Owner access</small></div>
            </div>
          </div>
        </header>

        <section className={styles.connection}>
          <div className={overview.connected ? styles.online : styles.offline}>
            <Database size={17} />
            <span>{overview.connected ? "System online" : "Setup required"}</span>
          </div>

          <p>
            {overview.connected
              ? "Core WADAN services are connected and ready."
              : overview.message || "Complete system setup to activate operations."}
          </p>

          <button type="button" onClick={refreshOverview} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? styles.spin : ""} />
            Refresh
          </button>
        </section>

        {tab === "overview" && (
          <>
            <section className={styles.metrics}>
              <article>
                <span><Users size={20} /></span>
                <div><small>Users</small><strong>{format(overview.users, 0)}</strong><em>Registered accounts</em></div>
              </article>
              <article>
                <span><CircleDollarSign size={20} /></span>
                <div><small>Pending deposits</small><strong>{format(overview.pendingDeposits, 0)}</strong><em>Awaiting confirmation</em></div>
              </article>
              <article>
                <span><WalletCards size={20} /></span>
                <div><small>Pending withdrawals</small><strong>{format(overview.pendingWithdrawals, 0)}</strong><em>Needs review</em></div>
              </article>
              <article>
                <span><Coins size={20} /></span>
                <div><small>Active stakes</small><strong>{format(overview.activeStakes, 0)}</strong><em>Open positions</em></div>
              </article>
            </section>

            <section className={styles.grid}>
              <article className={styles.panel}>
                <div className={styles.panelHead}>
                  <div><span>WALLET LIABILITY</span><strong>Platform balances</strong></div>
                  <BadgeDollarSign size={20} />
                </div>

                <div className={styles.balanceRows}>
                  <div><span>WDC wallets</span><strong>{format(overview.totalWdc)} WDC</strong></div>
                  <div><span>USDT wallets</span><strong>{format(overview.totalUsdt)} USDT</strong></div>
                  <div><span>Active staked</span><strong>{format(overview.activeStakedWdc)} WDC</strong></div>
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHead}>
                  <div><span>OPERATIONS</span><strong>Core systems</strong></div>
                  <Activity size={20} />
                </div>

                <div className={styles.systemRows}>
                  <div><span>Deposits</span><em className={overview.connected ? styles.ready : styles.setup}>{overview.connected ? "Ready" : "Setup"}</em></div>
                  <div><span>Withdrawals</span><em className={overview.connected ? styles.ready : styles.setup}>{overview.connected ? "Ready" : "Setup"}</em></div>
                  <div><span>Ledger</span><em className={overview.connected ? styles.ready : styles.setup}>{overview.connected ? "Ready" : "Setup"}</em></div>
                  <div><span>Staking</span><em className={overview.connected ? styles.ready : styles.setup}>{overview.connected ? "Ready" : "Setup"}</em></div>
                </div>
              </article>

              <article className={styles.widePanel}>
                <div className={styles.panelHead}>
                  <div><span>SECURITY</span><strong>Admin foundation</strong></div>
                  <LockKeyhole size={20} />
                </div>

                <div className={styles.securityGrid}>
                  <div><strong>Server-only database key</strong><span>Service-role credentials never go to the browser.</span></div>
                  <div><strong>Atomic wallet functions</strong><span>Balance changes are planned through PostgreSQL transactions.</span></div>
                  <div><strong>Audit logging</strong><span>Admin financial actions have a dedicated audit table.</span></div>
                  <div><strong>RLS locked by default</strong><span>Financial tables are not exposed to public clients.</span></div>
                </div>
              </article>
            </section>
          </>
        )}

        {tab === "users" && (
          <section className={styles.usersWorkspace}>
            <div className={styles.usersToolbar}>
              <div>
                <span>LIVE USERS</span>
                <strong>User directory</strong>
              </div>
              <div className={styles.userSearch}>
                <Search size={16}/>
                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search user"
                  aria-label="Search users"
                />
              </div>
              <button type="button" onClick={loadUsers} disabled={usersLoading}>
                <RefreshCw size={15} className={usersLoading ? styles.spin : ""}/>
                Refresh
              </button>
            </div>

            <div className={styles.usersSummary}>
              <div><small>Total loaded</small><strong>{users.length}</strong></div>
              <div><small>Active</small><strong>{users.filter((u) => u.status === "active").length}</strong></div>
              <div><small>KYC verified</small><strong>{users.filter((u) => u.kycStatus === "verified").length}</strong></div>
            </div>

            <div className={styles.usersList}>
              {usersLoading ? (
                <div className={styles.usersEmpty}><RefreshCw size={22} className={styles.spin}/><span>Loading users…</span></div>
              ) : users.filter((u) => {
                  const q = userQuery.trim().toLowerCase();
                  if (!q) return true;
                  return [u.displayName,u.externalUserId,u.email,u.phone,u.country,u.status,u.kycStatus]
                    .join(" ")
                    .toLowerCase()
                    .includes(q);
                }).length === 0 ? (
                <div className={styles.usersEmpty}><Users size={24}/><strong>No users yet</strong><span>New accounts will appear here after registration.</span></div>
              ) : (
                users
                  .filter((u) => {
                    const q = userQuery.trim().toLowerCase();
                    if (!q) return true;
                    return [u.displayName,u.externalUserId,u.email,u.phone,u.country,u.status,u.kycStatus]
                      .join(" ")
                      .toLowerCase()
                      .includes(q);
                  })
                  .map((u) => (
                    <article className={styles.userRow} key={u.id}>
                      <div className={styles.userAvatar}>{(u.displayName || u.externalUserId || "U").slice(0,2).toUpperCase()}</div>
                      <div className={styles.userIdentity}>
                        <strong>{u.displayName || "Unnamed user"}</strong>
                        <span>{u.email || u.phone || u.externalUserId || "No contact"}</span>
                      </div>
                      <div className={styles.userMeta}>
                        <span>{u.country || "—"}</span>
                        <em>{u.status}</em>
                      </div>
                      <div className={styles.userKyc}>
                        <small>KYC</small>
                        <strong>{u.kycStatus.replace("_"," ")}</strong>
                      </div>
                    </article>
                  ))
              )}
            </div>
          </section>
        )}

        {tab === "deposits" && (
          <section className={styles.usersWorkspace}>
            <div className={styles.usersToolbar}>
              <div><span>DEPOSIT REVIEW</span><strong>Incoming transactions</strong></div>
              <button type="button" onClick={loadDeposits} disabled={moduleLoading}><RefreshCw size={15} className={moduleLoading ? styles.spin : ""}/> Refresh</button>
            </div>
            {moduleMessage && <div className={styles.workspaceState}>{moduleMessage}</div>}
            <div className={styles.financeList}>
              {moduleLoading ? (
                <div className={styles.usersEmpty}><RefreshCw size={22} className={styles.spin}/><span>Loading deposits…</span></div>
              ) : deposits.length ? deposits.map((item)=>(
                <article className={styles.financeCard} key={item.id}>
                  <div className={styles.financeCardTop}>
                    <div className={styles.financeIdentity}>
                      <div className={styles.userAvatar}>{item.asset}</div>
                      <div><strong>{item.userName}</strong><span>{item.email || "No email"}</span></div>
                    </div>
                    <em className={styles.statusPill}>{item.status}</em>
                  </div>

                  <div className={styles.financeAmount}>
                    <small>AMOUNT</small>
                    <strong>{format(item.amount,6)} {item.asset}</strong>
                  </div>

                  <div className={styles.financeMeta}>
                    <div><span>Network</span><strong>{item.network || "BSC"}</strong></div>
                    <div><span>Submitted</span><strong>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</strong></div>
                    <div className={styles.financeHash}><span>Transaction hash</span><code>{item.txHash || "—"}</code></div>
                  </div>

                  <div className={styles.depositActions}>
                    {item.status !== "confirmed" && item.status !== "rejected" ? (
                      <>
                        <button type="button" onClick={()=>actDeposit(item.id,"confirm")}>Confirm deposit</button>
                        <button type="button" className={styles.rejectAction} onClick={()=>actDeposit(item.id,"reject")}>Reject</button>
                      </>
                    ) : (
                      <span className={styles.completedAction}>Review completed</span>
                    )}
                  </div>
                </article>
              )) : (
                <div className={styles.usersEmpty}><CircleDollarSign size={24}/><strong>No deposits</strong><span>Submitted deposit transactions will appear here.</span></div>
              )}
            </div>
          </section>
        )}

        {tab === "withdrawals" && (
          <section className={styles.usersWorkspace}>
            <div className={styles.usersToolbar}>
              <div><span>WITHDRAWAL REVIEW</span><strong>Outgoing requests</strong></div>
              <button type="button" onClick={loadWithdrawals} disabled={moduleLoading}><RefreshCw size={15} className={moduleLoading ? styles.spin : ""}/> Refresh</button>
            </div>
            {moduleMessage && <div className={styles.workspaceState}>{moduleMessage}</div>}
            <div className={styles.financeList}>
              {moduleLoading ? (
                <div className={styles.usersEmpty}><RefreshCw size={22} className={styles.spin}/><span>Loading withdrawals…</span></div>
              ) : withdrawals.length ? withdrawals.map((item)=>(
                <article className={styles.financeCard} key={item.id}>
                  <div className={styles.financeCardTop}>
                    <div className={styles.financeIdentity}>
                      <div className={styles.userAvatar}>{item.asset}</div>
                      <div><strong>{item.userName}</strong><span>{item.email || "No email"}</span></div>
                    </div>
                    <em className={styles.statusPill}>{item.status}</em>
                  </div>
                  <div className={styles.financeAmount}>
                    <small>REQUESTED</small>
                    <strong>{format(item.amount,6)} {item.asset}</strong>
                  </div>
                  <div className={styles.financeMeta}>
                    <div><span>Fee</span><strong>{format(item.fee,6)} {item.asset}</strong></div>
                    <div><span>Submitted</span><strong>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</strong></div>
                    <div className={styles.financeHash}><span>Destination</span><code>{item.address}</code></div>
                    {item.txHash && <div className={styles.financeHash}><span>Transaction hash</span><code>{item.txHash}</code></div>}
                  </div>
                  <div className={styles.depositActions}>
                    {item.status === "pending" && <>
                      <button type="button" onClick={()=>actWithdrawal(item.id,"approve")}>Approve</button>
                      <button type="button" className={styles.rejectAction} onClick={()=>actWithdrawal(item.id,"reject")}>Reject</button>
                    </>}
                    {item.status === "approved" && <button type="button" onClick={()=>actWithdrawal(item.id,"sent")}>Mark sent</button>}
                    {!["pending","approved"].includes(item.status) && <span className={styles.completedAction}>Review completed</span>}
                  </div>
                </article>
              )) : (
                <div className={styles.usersEmpty}><WalletCards size={24}/><strong>No withdrawals</strong><span>User withdrawal requests will appear here.</span></div>
              )}
            </div>
          </section>
        )}

        {tab === "staking" && (
          <section className={styles.usersWorkspace}>
            <div className={styles.usersToolbar}>
              <div><span>STAKING PLANS</span><strong>Rates & availability</strong></div>
              <button type="button" onClick={loadPlans} disabled={moduleLoading}><RefreshCw size={15}/> Refresh</button>
            </div>
            {moduleMessage && <div className={styles.workspaceState}>{moduleMessage}</div>}
            <div className={styles.usersList}>
              {plans.map((plan)=>(
                <article className={styles.userRow} key={plan.id}>
                  <div className={styles.userAvatar}>{plan.id.toUpperCase()}</div>
                  <div className={styles.userIdentity}><strong>{plan.title}</strong><span>{plan.durationDays} days</span></div>
                  <div className={styles.planControls}>
                    <input
                      type="number"
                      step="0.01"
                      value={plan.dailyRate}
                      onChange={(e)=>setPlans((current)=>current.map((item)=>item.id===plan.id ? {...item,dailyRate:Number(e.target.value)} : item))}
                    />
                    <button type="button" onClick={()=>setPlans((current)=>current.map((item)=>item.id===plan.id ? {...item,enabled:!item.enabled} : item))}>{plan.enabled ? "Enabled" : "Disabled"}</button>
                    <button type="button" onClick={()=>savePlan(plan)}>Save</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === "settings" && settingsData && (
          <section className={styles.usersWorkspace}>
            <div className={styles.usersToolbar}>
              <div><span>PLATFORM SETTINGS</span><strong>Core financial controls</strong></div>
              <button type="button" onClick={loadSettings} disabled={moduleLoading}><RefreshCw size={15}/> Refresh</button>
            </div>
            {moduleMessage && <div className={styles.workspaceState}>{moduleMessage}</div>}
            <div className={styles.settingsGrid}>
              <label><span>WDC reference price (USD)</span><input type="number" step="0.0001" value={settingsData.wdcReferencePrice} onChange={(e)=>setSettingsData({...settingsData,wdcReferencePrice:Number(e.target.value)})}/><button type="button" onClick={()=>saveSetting("wdcReferencePrice",settingsData.wdcReferencePrice)}>Save</button></label>
              <label><span>BNB deposit address</span><input value={settingsData.depositAddressBsc} onChange={(e)=>setSettingsData({...settingsData,depositAddressBsc:e.target.value})}/><button type="button" onClick={()=>saveSetting("depositAddressBsc",settingsData.depositAddressBsc)}>Save</button></label>
              <label><span>WDC withdrawal fee</span><input type="number" step="0.0001" value={settingsData.withdrawFeeWdc} onChange={(e)=>setSettingsData({...settingsData,withdrawFeeWdc:Number(e.target.value)})}/><button type="button" onClick={()=>saveSetting("withdrawFeeWdc",settingsData.withdrawFeeWdc)}>Save</button></label>
              <label><span>USDT withdrawal fee</span><input type="number" step="0.0001" value={settingsData.withdrawFeeUsdt} onChange={(e)=>setSettingsData({...settingsData,withdrawFeeUsdt:Number(e.target.value)})}/><button type="button" onClick={()=>saveSetting("withdrawFeeUsdt",settingsData.withdrawFeeUsdt)}>Save</button></label>
            </div>
            <div className={styles.toggleGrid}>
              {([
                ["depositsEnabled","Deposits",settingsData.depositsEnabled],
                ["withdrawalsEnabled","Withdrawals",settingsData.withdrawalsEnabled],
                ["swapsEnabled","Swaps",settingsData.swapsEnabled],
                ["stakingEnabled","Staking",settingsData.stakingEnabled],
              ] as const).map(([key,label,value])=>(
                <button type="button" key={key} className={value ? styles.activeToggle : ""} onClick={()=>saveSetting(key,!value)}>
                  <span>{label}</span><strong>{value ? "Enabled" : "Disabled"}</strong>
                </button>
              ))}
            </div>
          </section>
        )}
      </section>

      {mounted && createPortal(
        <nav className={styles.mobileDock} aria-label="Admin navigation">
          <button type="button" className={tab === "overview" ? styles.mobileActive : ""} onClick={() => setTab("overview")}>
            <LayoutDashboard size={20}/><span>Home</span>
          </button>
          <button type="button" className={tab === "users" ? styles.mobileActive : ""} onClick={() => setTab("users")}>
            <Users size={20}/><span>Users</span>
          </button>
          <button type="button" className={tab === "deposits" ? styles.mobileActive : ""} onClick={() => setTab("deposits")}>
            <CircleDollarSign size={20}/><span>Deposit</span>
          </button>
          <button type="button" className={tab === "withdrawals" ? styles.mobileActive : ""} onClick={() => setTab("withdrawals")}>
            <WalletCards size={20}/><span>Withdraw</span>
          </button>
          <button type="button" className={tab === "staking" ? styles.mobileActive : ""} onClick={() => setTab("staking")}>
            <Coins size={20}/><span>Stake</span>
          </button>
        </nav>,
        document.body
      )}
    </main>
  );
}
