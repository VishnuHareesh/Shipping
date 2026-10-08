"use client";

import Image from "next/image";
import React from "react";
import truckTopView from "@/public/assets/truck-top-view.png";
import wheelTrailer from "@/public/assets/wheel_trailer.png";
import wheelDrive from "@/public/assets/wheel_drive.png";
import wheelSteer from "@/public/assets/wheel_steer.png";
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

// Top view truck 5 wheels positioned precisely along the chassis hubs
const TOP_WHEELS = [
  { id: "top-steer", src: wheelSteer, left: "11.43%", top: "64.91%" },
  { id: "top-drive", src: wheelDrive, left: "30.86%", top: "64.62%" },
  { id: "top-t1",    src: wheelTrailer, left: "66.99%", top: "64.62%" },
  { id: "top-t2",    src: wheelTrailer, left: "73.83%", top: "64.62%" },
  { id: "top-t3",    src: wheelTrailer, left: "80.66%", top: "64.62%" },
];

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
  topWheelsRef?: React.RefObject<(HTMLDivElement | null)[]>;
}

export default function RoadFrame({ truckMoverRef, topWheelsRef }: RoadFrameProps) {
  return (
    <section className={styles.roadFrame} id="frame-2" aria-label="Road services view">
      {/* Upper road edge marquee */}
      <RoadMarqueeRow className={styles.rowTop} />

      {/* Road center lane with top-view truck */}
      <div className={styles.lane}>
        <div ref={truckMoverRef} className={styles.truckMover}>
          <div className={styles.truckSway}>
            <div className={styles.truckWrapper}>
              <Image
                className={styles.truckImage}
                src={truckTopView}
                alt="Top-view container truck driving left"
                priority
              />

              {/* 5 Spinning Wheels along the bottom chassis */}
              {TOP_WHEELS.map(({ id, src, left, top }, idx) => (
                <div
                  key={id}
                  className={styles.topWheelHolder}
                  style={{ left, top }}
                >
                  <div
                    ref={(el) => {
                      if (topWheelsRef && topWheelsRef.current) {
                        topWheelsRef.current[idx] = el;
                      }
                    }}
                    className={styles.topWheelSpin}
                  >
                    <Image
                      src={src}
                      width={48}
                      height={48}
                      alt=""
                      priority
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lower road edge marquee */}
      <RoadMarqueeRow className={styles.rowBottom} />
    </section>
  );
}
