import React, { useLayoutEffect, useState } from 'react';

/** Layout "design" size the UI was tuned for; below this (on compact displays) we scale down uniformly. */
const BASE_W = 1280;
const BASE_H = 720;

/** Only apply uniform scaling when both dimensions look like a small / kiosk screen (e.g. Pi + 800×480). */
const COMPACT_MAX_W = 1400;
const COMPACT_MAX_H = 820;

/** Browser default root size; MUI typography uses rem from this. */
const ROOT_REM_PX = 16;

/**
 * When the viewport transform shrinks the UI, bump root rem so body copy stays more readable.
 * Tuning: higher = larger text on small screens (also affects rem-based spacing slightly).
 */
const FONT_BOOST_STRENGTH = 0.58;
const FONT_BOOST_MAX = 1.38;

function computeScale() {
  if (typeof window === 'undefined') return 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w > COMPACT_MAX_W || h > COMPACT_MAX_H) return 1;
  return Math.min(w / BASE_W, h / BASE_H, 1);
}

/** Root font multiplier when compact scaling is active (stronger when scale is lower). */
function rootFontMultiplier(scale) {
  if (scale >= 0.999) return 1;
  return Math.min(FONT_BOOST_MAX, 1 + (1 - scale) * FONT_BOOST_STRENGTH);
}

function applyRootFont(scale) {
  if (typeof document === 'undefined') return;
  if (scale >= 0.999) {
    document.documentElement.style.fontSize = '';
  } else {
    document.documentElement.style.fontSize = `${ROOT_REM_PX * rootFontMultiplier(scale)}px`;
  }
}

/**
 * Renders children at full layout size, then scales down with CSS transform so small viewports
 * (Raspberry Pi + 800×480, etc.) see the whole UI proportionally smaller instead of cramped reflow.
 * Root rem is increased while scaled so text (MUI/rem) stays legible relative to the shrunk canvas.
 */
export default function ViewportScale({ children }) {
  const [scale, setScale] = useState(computeScale);

  useLayoutEffect(() => {
    const update = () => {
      const s = computeScale();
      setScale(s);
      applyRootFont(s);
    };
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      applyRootFont(1);
    };
  }, []);

  if (scale >= 0.999) {
    return children;
  }

  const inv = 1 / scale;
  return (
    <div
      style={{
        width: `${inv * 100}%`,
        minHeight: `${inv * 100}vh`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      {children}
    </div>
  );
}
