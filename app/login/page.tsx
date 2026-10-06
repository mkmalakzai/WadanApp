"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, LockKeyhole, Mail, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function LoginPage() {
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") || ""),
          password: String(form.get("password") || ""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to log in.");
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell premium-auth">
      <div className="public-grid-bg" />
      <div className="auth-glow one" />
      <div className="auth-glow two" />

      <section className="auth-wrap-new gradient-border">
        <aside className="auth-brand-panel">
          <Link href="/" className="public-brand">
            <img src="/wadan-mark.svg" alt="WADAN"/>
            <div><strong>WADAN</strong><span>Wadan Coin • WDC</span></div>
          </Link>

          <div className="auth-brand-copy">
            <p>WELCOME BACK</p>
            <h1>Enter your <span>WADAN</span> dashboard.</h1>
            <em>Manage WDC, staking, swaps, referrals and your complete account activity from one place.</em>
          </div>

          <div className="auth-benefits">
            <div><span><ShieldCheck size={17}/></span><div><strong>Account protection</strong><small>Security focused access</small></div></div>
            <div><span><Zap size={17}/></span><div><strong>Fast dashboard</strong><small>Your tools in one place</small></div></div>
            <div><span><Sparkles size={17}/></span><div><strong>WDC ecosystem</strong><small>Built for future utility</small></div></div>
          </div>
        </aside>

        <section className="auth-form-panel login-panel">
          <Link href="/" className="auth-back"><ArrowLeft size={14}/> Back to website</Link>
          <div className="auth-title">
            <p>ACCOUNT ACCESS</p>
            <h2>Log in</h2>
            <span>Enter your WADAN account details.</span>
          </div>

          <form className="signup-form login-form" onSubmit={submitLogin}>
            <div className="field">
              <label>Email address</label>
              <div className="input-shell"><Mail size={15}/><input name="email" required type="email" placeholder="you@example.com" autoComplete="email"/></div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="input-shell"><LockKeyhole size={15}/><input name="password" required type="password" placeholder="Enter password" autoComplete="current-password"/></div>
            </div>

            <div className="login-options">
              <label className="terms-line compact"><input type="checkbox"/><span>Remember me</span></label>
              <a href="#">Forgot password?</a>
            </div>

            {error && <div className="auth-live-message error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in to WADAN"}
            </button>
          </form>

          <p className="auth-switch">New to WADAN? <Link href="/signup">Create account</Link></p>
          <div className="auth-preview-note">Authentication is now connected to the WADAN backend.</div>
        </section>
      </section>
    </main>
  );
}
