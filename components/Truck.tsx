"use client";

import Image from "next/image";
import React, { useRef } from "react";
import truckBodyImage from "@/public/assets/truck_body@2x.png";
import wheelTrailer from "@/public/assets/wheel_trailer.png";
import wheelDrive from "@/public/assets/wheel_drive.png";
import wheelSteer from "@/public/assets/wheel_steer.png";
import styles from "./Truck.module.css";

const WHEELS = [
  { id: "trailer-1", src: wheelTrailer, left: 89.25 },
  { id: "trailer-2", src: wheelTrailer, left: 136.25 },
  { id: "trailer-3", src: wheelTrailer, left: 182.75 },
  { id: "drive",     src: wheelDrive,   left: 403.75 },
  { id: "steer",     src: wheelSteer,   left: 536.75 },
];

interface TruckProps {
  truckRef?: React.RefObject<HTMLDivElement | null>;
  wheelsRef?: React.RefObject<(HTMLDivElement | null)[]>;
}

export default function Truck({ truckRef: externalTruckRef, wheelsRef: externalWheelsRef }: TruckProps) {
  const internalTruckRef = useRef<HTMLDivElement>(null);
  const internalWheelsRef = useRef<(HTMLDivElement | null)[]>([]);

  const truckRef = externalTruckRef || internalTruckRef;
  const wheelsRef = externalWheelsRef || internalWheelsRef;

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
            if (wheelsRef.current) {
              wheelsRef.current[idx] = el;
            }
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
      <Image
        className={styles.body}
        src={truckBodyImage}
        width={633}
        height={211}
        sizes="633px"
        alt=""
        priority
      />
    </div>
  );
}
