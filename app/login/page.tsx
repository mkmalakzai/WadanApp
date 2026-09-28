import Link from "next/link";
import { ArrowLeft, LockKeyhole, Mail, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function LoginPage() {
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
            <span>Enter your account details to continue.</span>
          </div>

          <form className="signup-form login-form">
            <div className="field">
              <label>Email address</label>
              <div className="input-shell"><Mail size={15}/><input type="email" placeholder="you@example.com" autoComplete="email"/></div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="input-shell"><LockKeyhole size={15}/><input type="password" placeholder="Enter password" autoComplete="current-password"/></div>
            </div>

            <div className="login-options">
              <label className="terms-line compact"><input type="checkbox"/><span>Remember me</span></label>
              <a href="#">Forgot password?</a>
            </div>

            <Link href="/dashboard" className="auth-submit as-link">Log in to WADAN</Link>
          </form>

          <p className="auth-switch">New to WADAN? <Link href="/signup">Create account</Link></p>
          <div className="auth-preview-note">Frontend preview: real authentication and password recovery will be connected in the backend phase.</div>
        </section>
      </section>
    </main>
  );
}
