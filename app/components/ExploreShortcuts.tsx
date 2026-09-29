import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  CircleHelp,
  Gift,
  Grid2X2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import styles from "./ExploreShortcuts.module.css";

const shortcuts = [
  { label:"Free Earn", icon:Gift, href:"/explore#earn" },
  { label:"KYC", icon:BadgeCheck, href:"/explore#identity" },
  { label:"Security", icon:ShieldCheck, href:"/account?tab=security" },
  { label:"Rewards", icon:Sparkles, href:"/staking" },
  { label:"Referral", icon:Users, href:"/referrals" },
  { label:"Learn", icon:BookOpen, href:"/explore#discover" },
  { label:"Support", icon:CircleHelp, href:"/explore#discover" },
];

export default function ExploreShortcuts(){
  return (
    <section className={styles.wrap} aria-label="Explore WADAN">
      <div className={styles.head}>
        <div>
          <span>EXPLORE WADAN</span>
          <strong>Shortcuts</strong>
        </div>
        <Link href="/explore">More <Grid2X2 size={14}/></Link>
      </div>

      <div className={styles.grid}>
        {shortcuts.map((item)=>{
          const Icon=item.icon;
          return (
            <Link className={styles.item} href={item.href} key={item.label}>
              <span className={styles.icon}><Icon size={21}/></span>
              <strong>{item.label}</strong>
            </Link>
          );
        })}
        <Link className={styles.item} href="/explore">
          <span className={styles.icon+" "+styles.more}><Grid2X2 size={21}/></span>
          <strong>More</strong>
        </Link>
      </div>
    </section>
  );
}
