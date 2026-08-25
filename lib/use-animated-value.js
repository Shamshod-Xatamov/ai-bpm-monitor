"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(callback) {
  const media = window.matchMedia(MOTION_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

const readMotion = () => window.matchMedia(MOTION_QUERY).matches;
const readServerMotion = () => false;

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeToMotion, readMotion, readServerMotion);
}

/**
 * Raqamni eski qiymatdan yangisiga silliq o‘tkazadi, shunda live ko‘rsatkichlar
 * sakrab emas, oqib o‘zgaradi. `prefers-reduced-motion` yoqilgan bo‘lsa
 * animatsiya butunlay o‘tkazib yuboriladi.
 */
export function useAnimatedValue(target, duration = 720) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(target);
  const currentRef = useRef(target);
  const frameRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      currentRef.current = target;
      return undefined;
    }

    const from = currentRef.current;
    if (Math.abs(from - target) < 0.001) return undefined;

    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const next = from + (target - from) * eased;

      currentRef.current = next;
      setValue(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        currentRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, reduced]);

  return reduced ? target : value;
}
