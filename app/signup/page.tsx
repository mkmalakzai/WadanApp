"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Globe2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import en from "react-phone-number-input/locale/en.json";
import type { Country } from "react-phone-number-input";

export default function SignupPage() {
  const countries = useMemo(() => getCountries(), []);
  const [country, setCountry] = useState<Country>("AF");
  const callingCode = getCountryCallingCode(country);

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
            <p>JOIN THE ECOSYSTEM</p>
            <h1>Create your <span>WADAN</span> account.</h1>
            <em>One account for your balance, staking, swap, referrals and complete WDC activity.</em>
          </div>

          <div className="auth-benefits">
            <div><span><ShieldCheck size={17}/></span><div><strong>Secure profile</strong><small>Account-level security controls</small></div></div>
            <div><span><Globe2 size={17}/></span><div><strong>Global access</strong><small>Country-aware signup experience</small></div></div>
            <div><span><UserRound size={17}/></span><div><strong>Personal dashboard</strong><small>Your WDC ecosystem in one place</small></div></div>
          </div>
        </aside>

        <section className="auth-form-panel">
          <Link href="/" className="auth-back"><ArrowLeft size={14}/> Back to website</Link>
          <div className="auth-title">
            <p>CREATE ACCOUNT</p>
            <h2>Join WADAN</h2>
            <span>Complete your details below.</span>
          </div>

          <form className="signup-form">
            <div className="form-row-two">
              <div className="field">
                <label>First name</label>
                <div className="input-shell"><UserRound size={15}/><input type="text" placeholder="First name" autoComplete="given-name"/></div>
              </div>
              <div className="field">
                <label>Last name</label>
                <div className="input-shell"><UserRound size={15}/><input type="text" placeholder="Last name" autoComplete="family-name"/></div>
              </div>
            </div>

            <div className="field">
              <label>Email address</label>
              <div className="input-shell"><Mail size={15}/><input type="email" placeholder="you@example.com" autoComplete="email"/></div>
            </div>

            <div className="form-row-two country-phone-row">
              <div className="field">
                <label>Country / region</label>
                <div className="input-shell select-shell">
                  <Globe2 size={15}/>
                  <select
                    value={country}
                    onChange={(e)=>setCountry(e.target.value as Country)}
                    aria-label="Country"
                  >
                    {countries.map((code)=>(
                      <option key={code} value={code}>{en[code]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Mobile number</label>
                <div className="input-shell phone-shell">
                  <Phone size={15}/>
                  <span className="dial-code">+{callingCode}</span>
                  <input type="tel" placeholder="70 123 4567" autoComplete="tel-national"/>
                </div>
              </div>
            </div>

            <div className="form-row-two">
              <div className="field">
                <label>Password</label>
                <div className="input-shell"><LockKeyhole size={15}/><input type="password" placeholder="Create password" autoComplete="new-password"/></div>
              </div>
              <div className="field">
                <label>Confirm password</label>
                <div className="input-shell"><LockKeyhole size={15}/><input type="password" placeholder="Repeat password" autoComplete="new-password"/></div>
              </div>
            </div>

            <div className="field">
              <label>Referral code <small>Optional</small></label>
              <div className="input-shell"><UserRound size={15}/><input type="text" placeholder="Enter referral code"/></div>
            </div>

            <label className="terms-line">
              <input type="checkbox"/>
              <span>I agree to the Terms, Privacy Policy and WADAN platform rules.</span>
            </label>

            <button type="button" className="auth-submit">Create WADAN account</button>
          </form>

          <p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p>
          <div className="auth-preview-note">Frontend preview: real signup, OTP/email verification and database storage will be connected in the backend phase.</div>
        </section>
      </section>
    </main>
  );
}
