"use client";

import { useEffect } from "react";

/**
 * Keeps the large landing markup server-rendered while progressively enhancing
 * navigation, reveal animations, tabs and counters in the browser.
 */
export default function LandingEnhancer() {
  useEffect(() => {
    import("./landingInteractions");
  }, []);

  return null;
}
