"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Coins, Home, UserRound, Users, WalletCards } from "lucide-react";
import { fetchCached } from "../../lib/client-cache";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/wallet", label: "Wallet", icon: WalletCards },
  { href: "/referrals", label: "Referral", icon: Users },
  { href: "/staking", label: "Stake", icon: Coins },
  { href: "/account", label: "Profile", icon: UserRound },
];

export default function MobileDock({ active }: { active?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const warm = [
      ["wallet:summary", "/api/wallet/summary"],
      ["account:me", "/api/account/me"],
      ["staking:overview", "/api/staking/overview"],
      ["referrals:overview", "/api/referrals/overview"],
      ["wallet:deposit", "/api/wallet/deposit"],
      ["history", "/api/history"],
    ] as const;

    for (const [key, url] of warm) {
      void fetchCached(key, url).catch(() => undefined);
    }

    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <nav className="wadan-mobile-dock" aria-label="Main navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.href;
        return (
          <Link key={item.href} href={item.href} className={isActive ? "active" : ""}>
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>,
    document.body
  );
}
