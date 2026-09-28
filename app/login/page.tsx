import Link from "next/link";
import { ArrowLeft, LockKeyhole, Mail, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <div className="bg-grid" />
      <div className="glow glow-a" />
      <div className="glow glow-b" />

      <section className="auth-wrap reveal">
        <aside className="auth-side">
          <Link href="/" className="auth-brand">
            <div className="brand-symbol"><span>W</span></div>
            <strong>WADAN</strong>
          </Link>

          <div className="auth-side-copy">
            <p className="eyebrow">WELCOME BACK</p>
            <h1>Enter the <span>WADAN</span> ecosystem.</h1>
            <p>Access your WDC balance, staking, swap activity and account dashboard from one secure place.</p>
          </div>

          <div className="auth-points">
            <div className="auth-point"><span><ShieldCheck size={14} /></span> Account security controls</div>
            <div className="auth-point"><span><Zap size={14} /></span> Fast dashboard access</div>
            <div className="auth-point"><span><Sparkles size={14} /></span> WDC ecosystem features</div>
          </div>
        </aside>

        <section className="auth-panel">
          <Link href="/" className="auth-back"><ArrowLeft size={14} /> Back to dashboard</Link>
          <h2>Log in</h2>
          <p className="auth-subtitle">Enter your account details to continue.</p>

          <form className="auth-form">
            <div className="field">
              <label>Email address</label>
              <div className="input-wrap">
                <Mail size={16} />
                <input type="email" placeholder="you@example.com" autoComplete="email" />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="input-wrap">
                <LockKeyhole size={16} />
                <input type="password" placeholder="Enter your password" autoComplete="current-password" />
              </div>
            </div>

            <div className="form-row">
              <label className="check-row"><input type="checkbox" /> Remember me</label>
              <a href="#">Forgot password?</a>
            </div>

            <button type="button" className="submit-button">Log in to WADAN</button>
          </form>

          <p className="auth-switch">New to WADAN? <Link href="/signup">Create an account</Link></p>
          <div className="auth-note">Authentication UI is ready. Real account sign-in will be connected to the backend/database in the next development phase.</div>
        </section>
      </section>
    </main>
  );
}
