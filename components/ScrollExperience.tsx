"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "./Hero";
import RoadFrame from "./RoadFrame";
import styles from "./ScrollExperience.module.css";

gsap.registerPlugin(ScrollTrigger);

if (typeof window !== "undefined") {
  (window as any).ScrollTrigger = ScrollTrigger;
  (window as any).gsap = gsap;
}

export default function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const roadWrapperRef = useRef<HTMLDivElement>(null);

  // Frame 1 refs
  const sideTruckRef = useRef<HTMLDivElement>(null);
  const sideWheelsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Frame 2 refs
  const topTruckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotionQuery.matches) {
      // Show both frames statically without pins or scrubbing
      return;
    }

    const container = containerRef.current;
    const heroWrapper = heroWrapperRef.current;
    const roadWrapper = roadWrapperRef.current;
    const sideTruck = sideTruckRef.current;
    const topTruck = topTruckRef.current;

    if (!container || !heroWrapper || !roadWrapper || !sideTruck || !topTruck) return;

    const isMobile = window.innerWidth <= 768;
    const pinDistance = isMobile ? window.innerHeight * 1.7 : window.innerHeight * 2.6;

    // Calculate exit distance for side-view truck (~120vw)
    const exitDistance = Math.max(window.innerWidth * 1.25, 1400);

    // Wheel rotation:
    // Radius R = 20.75px -> 360 / (2 * PI * 20.75) ~ 2.762 deg/px
    // Spun slightly faster while moving (1.25x multiplier ~ 3.45 deg/px)
    const totalWheelRotation = exitDistance * 3.45;

    // Filter valid wheel elements
    const wheelElements = sideWheelsRef.current.filter(Boolean);

    // Ensure initial transforms
    gsap.set(heroWrapper, { yPercent: 0 });
    gsap.set(roadWrapper, { yPercent: 100 });
    gsap.set(sideTruck, { x: 0 });
    gsap.set(wheelElements, { rotation: 0 });
    // Top-view truck starts fully off-screen right
    const topTruckEntryX = Math.max(window.innerWidth * 1.2, 1400);
    gsap.set(topTruck, { x: topTruckEntryX });

    // Master ScrollTrigger Timeline
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: `+=${pinDistance}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // -------------------------------------------------------------
    // FRAME 1: Side truck drives right and fully leaves viewport (~120vw)
    // Timeline 0.0 -> 3.0
    // -------------------------------------------------------------
    masterTl.to(
      sideTruck,
      {
        x: exitDistance,
        ease: "none",
        duration: 3.0,
      },
      0
    );

    masterTl.to(
      wheelElements,
      {
        rotation: totalWheelRotation,
        ease: "none",
        duration: 3.0,
      },
      0
    );

    // -------------------------------------------------------------
    // TRANSITION: Frame 1 slides up, Frame 2 slides up to full view
    // Timeline 3.0 -> 4.2
    // -------------------------------------------------------------
    masterTl.to(
      heroWrapper,
      {
        yPercent: -100,
        ease: "power1.inOut",
        duration: 1.2,
      },
      3.0
    );

    masterTl.to(
      roadWrapper,
      {
        yPercent: 0,
        ease: "power1.inOut",
        duration: 1.2,
      },
      3.0
    );

    // -------------------------------------------------------------
    // TRANSITION PAUSE: ~30vh of scroll where only the road text is
    // moving and no truck is visible (top truck held off-screen right)
    // Timeline 4.2 -> 5.4
    // -------------------------------------------------------------
    masterTl.to(
      topTruck,
      {
        x: topTruckEntryX,
        duration: 1.2,
        ease: "none",
      },
      4.2
    );

    // -------------------------------------------------------------
    // FRAME 2: Top truck returns (enters from off-screen right
    // and settles at its reference position on the right side)
    // Timeline 5.4 -> 9.2
    // -------------------------------------------------------------
    masterTl.to(
      topTruck,
      {
        x: 0,
        ease: "power2.out",
        duration: 3.8,
      },
      5.4
    );

    // Rest hold before unpinning (Timeline 9.2 -> 10.0)
    masterTl.to(
      topTruck,
      {
        x: 0,
        duration: 0.8,
        ease: "none",
      },
      9.2
    );

    // -------------------------------------------------------------
    // SCROLL VELOCITY CONTROLLER:
    // Speeds up all marquees (data-marquee="true") briefly during scroll,
    // then smoothly eases them back to normal rate (1.0).
    // -------------------------------------------------------------
    const rateState = { value: 1 };
    let easeBackTimer: NodeJS.Timeout | null = null;

    const setAllMarqueeRates = (rate: number) => {
      const marquees = document.querySelectorAll<HTMLElement>("[data-marquee]");
      marquees.forEach((el) => {
        el.getAnimations().forEach((anim) => {
          anim.playbackRate = rate;
        });
      });
    };

    const velocityTrigger = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = Math.abs(self.getVelocity());
        if (v > 100) {
          const targetBoost = Math.min(1 + v / 550, 3.5);
          gsap.killTweensOf(rateState);

          gsap.to(rateState, {
            value: targetBoost,
            duration: 0.1,
            ease: "none",
            onUpdate: () => setAllMarqueeRates(rateState.value),
          });

          if (easeBackTimer) clearTimeout(easeBackTimer);
          easeBackTimer = setTimeout(() => {
            gsap.to(rateState, {
              value: 1,
              duration: 0.7,
              ease: "power2.out",
              onUpdate: () => setAllMarqueeRates(rateState.value),
            });
          }, 120);
        }
      },
    });

    return () => {
      if (easeBackTimer) clearTimeout(easeBackTimer);
      velocityTrigger.kill();
      masterTl.kill();
      if (masterTl.scrollTrigger) {
        masterTl.scrollTrigger.kill();
      }
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className={styles.container}>
        {/* Frame 1: Hero */}
        <div ref={heroWrapperRef} className={styles.heroSection}>
          <Hero truckRef={sideTruckRef} wheelsRef={sideWheelsRef} />
        </div>

        {/* Frame 2: Road Frame with Top-View Truck */}
        <div ref={roadWrapperRef} className={styles.roadSection}>
          <RoadFrame truckMoverRef={topTruckRef} />
        </div>
      </div>

      {/* Continuation area after unpinning */}
      <div className={styles.continuation} />
    </>
  );
}
