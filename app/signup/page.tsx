import Link from "next/link";
import { ArrowLeft, Globe2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";

export default function SignupPage() {
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
            <p className="eyebrow">CREATE YOUR ACCOUNT</p>
            <h1>Start your <span>WDC</span> journey.</h1>
            <p>Create one account for your WADAN wallet balance, staking plans, swaps, deposits, withdrawals and activity history.</p>
          </div>

          <div className="auth-points">
            <div className="auth-point"><span><ShieldCheck size={14} /></span> Secure account profile</div>
            <div className="auth-point"><span><Globe2 size={14} /></span> Designed for global access</div>
            <div className="auth-point"><span><UserRound size={14} /></span> Personal dashboard and history</div>
          </div>
        </aside>

        <section className="auth-panel signup-panel">
          <Link href="/" className="auth-back"><ArrowLeft size={14} /> Back to dashboard</Link>
          <h2>Create account</h2>
          <p className="auth-subtitle">Complete your basic profile to join the WADAN ecosystem.</p>

          <form className="auth-form">
            <div className="form-grid-two">
              <div className="field">
                <label>First name</label>
                <div className="input-wrap">
                  <UserRound size={16} />
                  <input type="text" placeholder="First name" autoComplete="given-name" />
                </div>
              </div>
              <div className="field">
                <label>Last name</label>
                <div className="input-wrap">
                  <UserRound size={16} />
                  <input type="text" placeholder="Last name" autoComplete="family-name" />
                </div>
              </div>
            </div>

            <div className="field">
              <label>Email address</label>
              <div className="input-wrap">
                <Mail size={16} />
                <input type="email" placeholder="you@example.com" autoComplete="email" />
              </div>
            </div>

            <div className="field">
              <label>Country / region</label>
              <div className="input-wrap">
                <Globe2 size={16} />
                <input type="text" placeholder="Your country or region" autoComplete="country-name" />
              </div>
            </div>

            <div className="form-grid-two">
              <div className="field">
                <label>Password</label>
                <div className="input-wrap">
                  <LockKeyhole size={16} />
                  <input type="password" placeholder="Create password" autoComplete="new-password" />
                </div>
              </div>
              <div className="field">
                <label>Confirm password</label>
                <div className="input-wrap">
                  <LockKeyhole size={16} />
                  <input type="password" placeholder="Repeat password" autoComplete="new-password" />
                </div>
              </div>
            </div>

            <div className="field">
              <label>Referral code <span style={{ color: "#66616d" }}>(optional)</span></label>
              <div className="input-wrap">
                <UserRound size={16} />
                <input type="text" placeholder="Enter referral code" />
              </div>
            </div>

            <label className="check-row" style={{ fontSize: 9, color: "#77737d" }}>
              <input type="checkbox" /> I agree to the Terms, Privacy Policy and platform rules.
            </label>

            <button type="button" className="submit-button">Create WADAN account</button>
          </form>

          <p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p>
          <div className="auth-note">This is the complete signup interface. Account creation, email verification and database storage will be connected when we build the backend.</div>
        </section>
      </section>
    </main>
  );
}
