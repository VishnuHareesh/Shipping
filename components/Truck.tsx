"use client";

// Scroll-activated truck loop: the truck drives only while the user is scrolling,
// eases to a stop when scrolling stops, and wraps around the screen.
// Scrolling down drives it right; scrolling up drives it back left.

import Image from "next/image";
import { useEffect, useRef } from "react";
import truckBodyBlack from "@/public/assets/truck_body@2x.png";
import truckBodyOrange from "@/public/assets/truck_body_orange.png";
import truckBodyBlue from "@/public/assets/truck_body_blue.png";
import truckBodyYellow from "@/public/assets/truck_body_yellow.png";
import wheelTrailer from "@/public/assets/wheel_trailer.png";
import wheelDrive from "@/public/assets/wheel_drive.png";
import wheelSteer from "@/public/assets/wheel_steer.png";
import styles from "./Truck.module.css";

export type TruckColor = "black" | "orange" | "blue" | "yellow";

const TRUCK_BODIES: Record<TruckColor, any> = {
  black: truckBodyBlack,
  orange: truckBodyOrange,
  blue: truckBodyBlue,
  yellow: truckBodyYellow,
};

const SPEED = 600;        // px per second while scrolling — lower = slower truck
const EASE = 10;          // how quickly it speeds up / slows down (higher = snappier)
const IDLE_MS = 180;      // scrolling counts as stopped after this long without input

const KEY_DIRECTIONS: Record<string, number> = {
  ArrowDown: 1, PageDown: 1, " ": 1, End: 1, ArrowUp: -1, PageUp: -1, Home: -1,
};

const WHEELS = [
  { id: "trailer-1", src: wheelTrailer, left: 89.25 },
  { id: "trailer-2", src: wheelTrailer, left: 136.25 },
  { id: "trailer-3", src: wheelTrailer, left: 182.75 },
  { id: "drive",     src: wheelDrive,   left: 403.75 },
  { id: "steer",     src: wheelSteer,   left: 536.75 },
];

const sendDebug = (msg: any) => {
  fetch("/api/debug", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(msg),
  }).catch(() => {});
};

export default function Truck({ color = "black" }: { color?: TruckColor }) {
  const truckRef = useRef<HTMLDivElement>(null);
  const wheelsRef = useRef<(HTMLDivElement | null)[]>([]);


  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      sendDebug({ event: "error", message: e.message, filename: e.filename, lineno: e.lineno });
    };
    window.addEventListener("error", onError);

    const truck = truckRef.current;
    const hero = truck?.parentElement;
    sendDebug({
      event: "mount",
      ua: navigator.userAgent,
      hasTruck: !!truck,
      hasHero: !!hero,
    });
    if (!truck || !hero) return;

    // Loop points, measured from the real screen width (like Figma's 9:162 loop, but not tied to 1408px):
    // leave fully past the right edge, then re-enter from fully off-screen left.
    let exitX = 0, entryX = 0, cycle = 0, minVisibleX = 0, maxVisibleX = 0;
    const measure = () => {
      const left = truck.offsetLeft || 227.5;
      const width = truck.offsetWidth || 633;
      const screen = hero.clientWidth || window.innerWidth;
      exitX = screen - left;          // truck's left edge has passed the right edge
      entryX = -(left + width);       // truck's right edge sits at the left edge
      cycle = exitX - entryX;
      minVisibleX = -left;            // fully visible range
      maxVisibleX = screen - left - width;
      sendDebug({ event: "measure", left, width, screen, exitX, entryX, cycle });
    };
    measure();

    let x = 0;                        // current offset from the truck's Figma position
    let velocity = 0;
    let direction = 1;
    let wheelRotation = 0;            // degrees of tire spin
    let lastInput = -Infinity;
    let lastFrame = 0;
    let rafId: number | null = null;
    let frameCount = 0;

    // True when part of the truck is out of view (and the screen is wide enough to show it all)
    const offScreen = () => minVisibleX <= maxVisibleX && (x < minVisibleX || x > maxVisibleX);

    const frame = (now: number) => {
      const dt = lastFrame === 0 ? 0.016 : Math.max(0, Math.min((now - lastFrame) / 1000, 0.05));
      lastFrame = now;

      const scrolling = performance.now() - lastInput < IDLE_MS;
      // Keep driving after scrolling stops until the truck is fully back on screen
      const driving = scrolling || offScreen();
      const target = driving ? direction * SPEED : 0;
      velocity += (target - velocity) * Math.min(1, dt * EASE);

      const dx = velocity * dt;
      x += dx;
      if (x > exitX) x -= cycle;
      if (x < entryX) x += cycle;
      truck.style.transform = `translate3d(${x}px, 0, 0)`;

      // Rotate wheels based on displacement:
      // Radius R = 20.75px -> 360 / (2 * PI * 20.75) ~ 2.762 deg/px
      wheelRotation = (wheelRotation + dx * 2.762) % 360;
      const rotStr = `rotate(${wheelRotation}deg)`;
      for (let i = 0; i < wheelsRef.current.length; i++) {
        const wheelEl = wheelsRef.current[i];
        if (wheelEl) wheelEl.style.transform = rotStr;
      }

      frameCount++;
      if (frameCount % 10 === 0) {
        sendDebug({ event: "frame_tick", x, velocity, driving, scrolling, dt });
      }

      if (driving || Math.abs(velocity) > 0.5) {
        rafId = requestAnimationFrame(frame);
      } else {
        velocity = 0;
        rafId = null;
        sendDebug({ event: "raf_stop", finalX: x });
      }
    };

    const onInput = (dir: number) => {
      if (dir === 0) return;
      direction = dir > 0 ? 1 : -1;
      lastInput = performance.now();
      if (rafId === null) {
        lastFrame = 0;
        frameCount = 0;
        rafId = requestAnimationFrame(frame);
        sendDebug({ event: "raf_start", dir, lastInput });
      }
    };

    // Wheel / trackpad: non-passive listener with preventDefault prevents Safari overscroll
    // rubber-banding and ensures Safari dispatches wheel events on fixed/overflow:hidden viewports.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sendDebug({ event: "wheel", deltaY: e.deltaY, deltaX: e.deltaX });
      onInput(Math.sign(e.deltaY));
    };

    // Touch: finger moving up = scrolling down
    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      if (touchY !== null) {
        e.preventDefault();
        onInput(Math.sign(touchY - y));
      }
      touchY = y;
    };

    // Keyboard scrolling
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key in KEY_DIRECTIONS) onInput(KEY_DIRECTIONS[e.key]);
    };

    window.addEventListener("resize", measure);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("error", onError);
      window.removeEventListener("resize", measure);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div
      ref={truckRef}
      className={styles.truck}
      role="img"
      aria-label="Container truck"
    >
      {WHEELS.map(({ id, src, left }, idx) => (
        <div
          key={id}
          ref={(el) => {
            wheelsRef.current[idx] = el;
          }}
          className={styles.wheel}
          style={{ left: `${left}px` }}
        >
          <Image
            src={src}
            width={44}
            height={44}
            alt=""
            priority
          />
        </div>
      ))}
      {(Object.keys(TRUCK_BODIES) as TruckColor[]).map((c) => (
        <Image
          key={c}
          className={`${styles.body} ${color === c ? styles.activeBody : styles.hiddenBody}`}
          src={TRUCK_BODIES[c]}
          width={633}
          height={211}
          sizes="633px"
          alt={color === c ? `Container truck in ${c}` : ""}
          priority
        />
      ))}
    </div>
  );
}
