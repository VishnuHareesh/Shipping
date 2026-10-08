import Image from "next/image";
import logo from "@/public/assets/logo.svg";
import menu from "@/public/assets/menu.svg";
import Truck from "./Truck";
import styles from "./Hero.module.css";

const NAV_LINKS = [
  { label: "ABOUT", href: "#about" },
  { label: "SERVICES", href: "#services" },
  { label: "CAREERS", href: "#careers" },
  { label: "CONTACT", href: "#contact" },
];

// Three identical groups (Figma 12:2, 9:155, 12:8), one loop period apart
const MARQUEE_COPIES = 3;

function MarqueeGroup() {
  return (
    <div className={styles.group}>
      <span className={`${styles.word} ${styles.services}`}>
        <span className={styles.accent}>Our</span> Services
      </span>
      <span className={`${styles.word} ${styles.cargo}`}>Cargo</span>
      <span className={`${styles.word} ${styles.shipping}`}>Shipping</span>
      <span className={`${styles.word} ${styles.delivery}`}>Delivery</span>
      <span className={`${styles.word} ${styles.logistics}`}>LOGISTICS</span>
    </div>
  );
}

export default function Hero() {
  return (
    <section className={styles.hero}>
      <header className={styles.nav}>
        <a className={styles.logo} href="#" aria-label="Home">
          <Image src={logo} alt="" priority />
        </a>
        <nav className={styles.links}>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
          <button className={styles.menu} type="button" aria-label="Open menu">
            <Image src={menu} alt="" />
          </button>
        </nav>
      </header>

      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.track}>
          {Array.from({ length: MARQUEE_COPIES }, (_, i) => (
            <MarqueeGroup key={i} />
          ))}
        </div>
      </div>

      <div className={styles.ground} />

      <Truck />
    </section>
  );
}
