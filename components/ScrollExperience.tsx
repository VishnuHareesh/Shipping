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

    const screenW = window.innerWidth;
    const isMobile = screenW <= 768;

    // Reduced truck speed: generous pin distance so trucks move at a steady, calm, realistic pace
    // Two seamless cycles: 700vh total (350vh per cycle on desktop, 500vh on mobile)
    const pinDistance = isMobile ? window.innerHeight * 5.0 : window.innerHeight * 7.0;

    // Exact geometric offsets
    const truckBodyLeft = 227.5;
    const sideTruckW = sideTruck.offsetWidth || 633;
    const sideExitRight = screenW - truckBodyLeft + 120;
    const sideEnterLeft = -(truckBodyLeft + sideTruckW + 120);

    const topTruckW = topTruck.offsetWidth || Math.min(screenW * 0.44, 580);
    const topEntryRight = screenW + 100;
    const topExitLeft = -(topTruckW + 120);

    // Filter valid wheel elements
    const wheelElements = sideWheelsRef.current.filter(Boolean);

    // Set initial layout states
    gsap.set(heroWrapper, { yPercent: 0 });
    gsap.set(roadWrapper, { yPercent: 100 });
    gsap.set(sideTruck, { x: 0 });
    gsap.set(wheelElements, { rotation: 0 });
    gsap.set(topTruck, { x: topEntryRight, yPercent: -50 });

    // Master ScrollTrigger Timeline
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: `+=${pinDistance}`,
        pin: true,
        scrub: 0.8, // Smooth cinematic scrub
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    let currentRotation = 0;

    // Helper to add one complete loop cycle to the timeline
    const addCycle = (startTime: number) => {
      const cycleDuration = 10.0;

      // 1. FRAME 1: Side truck drives right and fully exits (~40% of cycle, reduced speed)
      // Duration: 2.8s
      const exitRot = sideExitRight * 3.45;
      masterTl.to(
        sideTruck,
        {
          x: sideExitRight,
          ease: "none",
          duration: 2.8,
        },
        startTime
      );
      masterTl.to(
        wheelElements,
        {
          rotation: currentRotation + exitRot,
          ease: "none",
          duration: 2.8,
        },
        startTime
      );
      currentRotation += exitRot;

      // 2. TRANSITION: Frame 1 slides up, Frame 2 slides in
      // Duration: 1.0s (startTime + 2.8 -> startTime + 3.8)
      masterTl.to(
        heroWrapper,
        {
          yPercent: -100,
          ease: "power1.inOut",
          duration: 1.0,
        },
        startTime + 2.8
      );
      masterTl.to(
        roadWrapper,
        {
          yPercent: 0,
          ease: "power1.inOut",
          duration: 1.0,
        },
        startTime + 2.8
      );

      // 3. ROAD TRANSITION PAUSE: ~30vh where only road text is moving, truck coming around
      // Duration: 1.0s (startTime + 3.8 -> startTime + 4.8)
      masterTl.to(
        topTruck,
        {
          x: topEntryRight,
          duration: 1.0,
          ease: "none",
        },
        startTime + 3.8
      );

      // 4. FRAME 2: Top truck enters from right, drives all the way across, and FULLY EXITS LEFT
      // Duration: 3.4s (startTime + 4.8 -> startTime + 8.2)
      masterTl.to(
        topTruck,
        {
          x: topExitLeft,
          ease: "none",
          duration: 3.4,
        },
        startTime + 4.8
      );

      // 5. TRANSITION BACK: Once top truck has fully exited left, Frame 2 slides down, Frame 1 slides back in
      // Duration: 1.0s (startTime + 8.2 -> startTime + 9.2)
      masterTl.to(
        roadWrapper,
        {
          yPercent: 100,
          ease: "power1.inOut",
          duration: 1.0,
        },
        startTime + 8.2
      );
      masterTl.to(
        heroWrapper,
        {
          yPercent: 0,
          ease: "power1.inOut",
          duration: 1.0,
        },
        startTime + 8.2
      );

      // Instantly position side truck off-screen left and top truck off-screen right for return
      masterTl.set(
        sideTruck,
        {
          x: sideEnterLeft,
        },
        startTime + 8.2
      );
      masterTl.set(
        topTruck,
        {
          x: topEntryRight,
        },
        startTime + 8.2
      );

      // 6. FRAME 1 RETURN: Side truck drives back in from left to original hero position
      // Duration: 0.8s (startTime + 9.2 -> startTime + 10.0)
      const returnRot = Math.abs(sideEnterLeft) * 3.45;
      masterTl.to(
        sideTruck,
        {
          x: 0,
          ease: "power1.out",
          duration: 0.8,
        },
        startTime + 9.2
      );
      masterTl.to(
        wheelElements,
        {
          rotation: currentRotation + returnRot,
          ease: "none",
          duration: 0.8,
        },
        startTime + 9.2
      );
      currentRotation += returnRot;
    };

    // Build Cycle 1 (0 -> 10) and Cycle 2 (10 -> 20) for continuous scrolling loop
    addCycle(0);
    addCycle(10.0);

    // Ensure ScrollTrigger measures the full page layout
    ScrollTrigger.refresh();

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
