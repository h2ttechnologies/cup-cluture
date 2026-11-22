"use client";

import { useEffect, useState } from "react";

// The whole intro runs on CSS (see ".cc-intro" in experience.css), so it starts the
// moment the page paints. A tiny inline script in layout.tsx adds "cc-seen" to <html>
// after the first visit in a browser session, which hides the intro on later page loads.
// This component only adds tap-to-skip and removes the overlay once it is finished.
const INTRO_MS = 3600;

export function IntroSplash() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("cc-seen")) { setGone(true); return; }
    const started = Number(document.documentElement.dataset.introStart || performance.now());
    const remaining = Math.max(0, INTRO_MS - (performance.now() - started));
    const timer = window.setTimeout(() => setGone(true), remaining);
    return () => window.clearTimeout(timer);
  }, []);

  const skip = () => {
    document.documentElement.classList.add("cc-intro-skip");
    window.setTimeout(() => setGone(true), 650);
  };

  if (gone) return null;

  return <div className="cc-intro" role="presentation" onClick={skip}>
    <div className="cc-intro-glow" aria-hidden="true"/>
    <div className="cc-intro-center">
      <div className="cc-intro-cup" aria-hidden="true">
        <span className="cc-intro-steam"><i/><i/><i/></span>
        <img src="/images/logo.jpg" alt=""/>
      </div>
      <div className="cc-intro-words" aria-hidden="true">
        <span>Good vibes.</span>
        <span>Great friends.</span>
        <span>Your hangout.</span>
      </div>
      <div className="cc-intro-brand">
        <strong>Cup Culture</strong>
        <small>Just what you needed.</small>
      </div>
    </div>
    <div className="cc-intro-dots" aria-hidden="true"><i/><i/><i/></div>
    <button type="button" className="cc-intro-skip" onClick={(event) => { event.stopPropagation(); skip(); }}>Skip</button>
  </div>;
}
