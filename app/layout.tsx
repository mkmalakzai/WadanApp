import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "WADAN • WDC",
  description: "WADAN digital ecosystem powered by WDC on BNB Smart Chain.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#06080C",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="wadan-ambient" aria-hidden="true">
          <span className="wadan-ambient-orb orb-a" />
          <span className="wadan-ambient-orb orb-b" />
          <span className="wadan-ambient-orb orb-c" />
          <span className="wadan-ambient-ring ring-a" />
          <span className="wadan-ambient-ring ring-b" />
          <span className="wadan-ambient-dust" />
        </div>
        <div className="wadan-app-layer">{children}</div>
      </body>
    </html>
  );
}
