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
import type { AdminOverview, AdminUser } from "../../lib/backend/admin";
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

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (tab === "users") {
      void loadUsers();
    }
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
            <span>Operations Console</span>
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
            <span>Temporary environment gate</span>
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
            <span>{overview.connected ? "Backend connected" : "Backend setup mode"}</span>
          </div>

          <p>
            {overview.connected
              ? "Supabase PostgreSQL is connected to the admin console."
              : overview.message || "Connect the database environment to activate live operations."}
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
                <div className={styles.usersEmpty}><Users size={24}/><strong>No users yet</strong><span>Real users will appear here after account registration is connected.</span></div>
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

        {tab !== "overview" && tab !== "users" && (
          <section className={styles.workspace}>
            <div className={styles.workspaceIcon}>
              {tab === "deposits" ? <CircleDollarSign size={28} /> :
               tab === "withdrawals" ? <WalletCards size={28} /> :
               tab === "staking" ? <Coins size={28} /> :
               <Settings size={28} />}
            </div>
            <span>{tab.toUpperCase()}</span>
            <h2>{nav.find((item) => item.id === tab)?.label} workspace</h2>
            <p>
              The database model for this module is included in the backend foundation.
              Live tables, review actions and filters will be wired in the next backend pass.
            </p>
            <div className={styles.workspaceState}>
              <Database size={16} />
              {overview.connected ? "Database connected" : "Waiting for database connection"}
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
