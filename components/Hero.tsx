"use client";

import Image from "next/image";
import { useState } from "react";
import logo from "@/public/assets/logo.svg";
import menu from "@/public/assets/menu.svg";
import Truck, { TruckColor } from "./Truck";
import styles from "./Hero.module.css";

const NAV_LINKS = [
  { label: "ABOUT", href: "#about" },
  { label: "SERVICES", href: "#services" },
  { label: "CAREERS", href: "#careers" },
  { label: "CONTACT", href: "#contact" },
];

const COLOR_OPTIONS: { id: TruckColor; label: string; hex: string; isBlack?: boolean }[] = [
  { id: "black", label: "Black (Original)", hex: "#121212", isBlack: true },
  { id: "orange", label: "Orange", hex: "#f25c05" },
  { id: "blue", label: "Blue", hex: "#0d6efd" },
  { id: "yellow", label: "Yellow", hex: "#f5b700" },
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
  const [truckColor, setTruckColor] = useState<TruckColor>("black");

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

      <Truck color={truckColor} />

      <div className={styles.colorPicker} role="radiogroup" aria-label="Truck Color Options">
        <span className={styles.colorLabel}>COLOR</span>
        <div className={styles.swatches}>
          {COLOR_OPTIONS.map(({ id, label, hex, isBlack }) => {
            const isActive = truckColor === id;
            return (
              <button
                key={id}
                type="button"
                className={`${styles.ellipseOption} ${isActive ? styles.active : ""} ${isBlack ? styles.blackSwatch : ""}`}
                onClick={() => setTruckColor(id)}
                role="radio"
                aria-checked={isActive}
                aria-label={`Switch truck color to ${label}`}
                title={label}
              >
                <span
                  className={styles.ellipseFill}
                  style={{ backgroundColor: hex }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

