import "./css/style.css";
import { drawTreeChart }     from "./modules/tree-chart.js";
import { initEucalyptusMap } from "./modules/eucalyptus-map.js";

const mainScroll = document.getElementById("main-scroll");
const progressBar = document.getElementById("scroll-progress-bar");

// Navigation au clavier (flèches Haut/Bas)
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    mainScroll.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    mainScroll.scrollBy({ top: -window.innerHeight, behavior: "smooth" });
  }
});

// ─────────────────────────────────────────────────────────────
// Barre de progression (basée sur le scroll du conteneur)
// ─────────────────────────────────────────────────────────────
function updateProgress() {
  const max = mainScroll.scrollHeight - mainScroll.clientHeight;
  const pct = max > 0 ? (mainScroll.scrollTop / max) * 100 : 0;
  progressBar.style.height = `${pct}%`;
}

mainScroll.addEventListener("scroll", updateProgress, { passive: true });

// ─────────────────────────────────────────────────────────────
// Animations fade-up — déclenchées à l'entrée de chaque section
// IntersectionObserver avec root = conteneur scrollable
// ─────────────────────────────────────────────────────────────
const fadeEls = document.querySelectorAll(".fade-up");

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = Number(el.dataset.delay ?? 0);
      setTimeout(() => el.classList.add("visible"), delay);
      fadeObserver.unobserve(el);
    });
  },
  {
    root:       mainScroll,   // observer dans le conteneur snap
    threshold:  0.1,
    rootMargin: "0px 0px -5% 0px",
  }
);

fadeEls.forEach((el) => fadeObserver.observe(el));

// ─────────────────────────────────────────────────────────────
// Graphique D3 — dessiné quand la section entre dans le snap
// ─────────────────────────────────────────────────────────────
let chartDrawn = false;
const chartTrigger = document.getElementById("chart-trigger");
const stickyTrees = document.querySelector(".sticky-trees");

const chartObserver = new IntersectionObserver(
  (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      if (stickyTrees) stickyTrees.classList.add("chart-active");
      if (!chartDrawn) {
        chartDrawn = true;
        drawTreeChart("#chart-trees");
      }
    } else {
      if (entry.boundingClientRect.top > 0) {
        // Scrolled back up past the trigger
        if (stickyTrees) stickyTrees.classList.remove("chart-active");
      } else {
        // Scrolled down past the trigger (it's above viewport)
        if (stickyTrees) stickyTrees.classList.add("chart-active");
      }
    }
  },
  { root: mainScroll, threshold: 0 }
);

if (chartTrigger) chartObserver.observe(chartTrigger);

// ─────────────────────────────────────────────────────────────
// Carte MapLibre — initialisée quand la section entre dans le snap
// ─────────────────────────────────────────────────────────────
let mapInited = false;
const screenMap = document.getElementById("screen-map");

const mapObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !mapInited) {
      mapInited = true;
      setTimeout(() => initEucalyptusMap("map-eucalyptus"), 150);
      mapObserver.disconnect();
    }
  },
  { root: mainScroll, threshold: 0.2 }
);

if (screenMap) mapObserver.observe(screenMap);
