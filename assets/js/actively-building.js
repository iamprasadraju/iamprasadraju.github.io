import { computeTimeline, taperPlugin, TegakiEngine } from "./tegaki/core/index.js";
import caveat from "./tegaki/fonts/caveat/bundle.js";

const root = document.querySelector(".actively-building");

if (root) {
  const segments = Array.from(
    root.querySelectorAll("[data-tegaki-segment]"),
  );
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const timing = {
    stagger: { advance: "70%", duration: 0.3 },
    strokeEasing: easeInOutCubic,
  };
  const speed = 1.4;
  const startDelay = 0.35;
  let delay = startDelay;

  root.classList.add("tegaki-ready");

  for (const segment of segments) {
    const text = segment.dataset.tegakiText ?? segment.textContent.trim();

    if (!text) {
      continue;
    }

    const duration = computeTimeline(text, caveat, timing).totalDuration / speed;

    segment.textContent = "";

    new TegakiEngine(segment, {
      font: caveat,
      text,
      timing,
      pressure: 0.6,
      quality: { pixelRatio: 2 },
      time: { mode: "uncontrolled", delay, speed },
      reducedMotion: "user",
      plugins: [taperPlugin()],
      onComplete: () => {
        segment.classList.add("is-written");

        const dot = segment.nextElementSibling;

        if (dot?.classList.contains("actively-building-dot")) {
          dot.classList.add("is-visible");
        }
      },
    });

    delay += duration * 0.85;
  }
}
