import type { ReactNode } from "react";

export default function WalletTemplate({ children }: { children: ReactNode }) {
  return <div className="route-transition-frame wallet-route-transition">{children}</div>;
}
