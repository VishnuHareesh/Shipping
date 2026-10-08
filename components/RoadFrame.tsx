"use client";

import Image from "next/image";
import React from "react";
import truckTopView from "@/public/assets/truck-top-view.png";
import styles from "./RoadFrame.module.css";

// Repeating word set matching reference.png layout and styling
const ROAD_WORDS = [
  { text: "OUR SERVICES", color: "#E8E8E8" },
  { text: "CARGO", color: "#E8E8E8" },
  { text: "SHIPPING", color: "#ED1C24" },
  { text: "OUR SERVICES", color: "#E8E8E8" },
  { text: "DELIVERY", color: "#FFFFFF" },
  { text: "CARGO", color: "#E8E8E8" },
  { text: "LOGISTICS", color: "#E8E8E8" },
  { text: "SHIPPING", color: "#ED1C24" },
  { text: "DELIVERY", color: "#FFFFFF" },
  { text: "LOGISTICS", color: "#E8E8E8" },
];

// Repeat 3 times per track half to ensure it easily covers ultrawide displays
const GROUP_WORDS = [...ROAD_WORDS, ...ROAD_WORDS, ...ROAD_WORDS];

function RoadMarqueeRow({ className }: { className: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className={styles.track} data-marquee="true">
        <div className={styles.group}>
          {GROUP_WORDS.map((item, idx) => (
            <span
              key={`a-${idx}`}
              className={styles.word}
              style={{ color: item.color }}
            >
              {item.text}
            </span>
          ))}
        </div>
        <div className={styles.group}>
          {GROUP_WORDS.map((item, idx) => (
            <span
              key={`b-${idx}`}
              className={styles.word}
              style={{ color: item.color }}
            >
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface RoadFrameProps {
  truckMoverRef?: React.RefObject<HTMLDivElement | null>;
}

export default function RoadFrame({ truckMoverRef }: RoadFrameProps) {
  return (
    <section className={styles.roadFrame} id="frame-2" aria-label="Road services view">
      {/* Upper road edge marquee */}
      <RoadMarqueeRow className={styles.rowTop} />

      {/* Road center lane with top-view truck */}
      <div className={styles.lane}>
        <div ref={truckMoverRef} className={styles.truckMover}>
          <div className={styles.truckSway}>
            <Image
              className={styles.truckImage}
              src={truckTopView}
              alt="Top-view container truck driving left"
              priority
            />
          </div>
        </div>
      </div>

      {/* Lower road edge marquee */}
      <RoadMarqueeRow className={styles.rowBottom} />
    </section>
  );
}
