import "./css/style.css";
import { drawTreeChart } from "./modules/tree-chart.js";
import { initEucalyptusMap } from "./modules/eucalyptus-map.js";

// ── Barre de progression (scroll réel) ──────────────────────────
const progressBar = document.getElementById("scroll-progress-bar");

function updateProgress() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const pct = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
  progressBar.style.height = `${pct}%`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// ── Révélation au scroll (IntersectionObserver) ──────────────────
const reveals = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay ?? 0;
        setTimeout(() => el.classList.add("visible"), Number(delay));
        revealObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.2 }
);

reveals.forEach((el) => revealObserver.observe(el));

// ── Graphique arbres (écran 3) ───────────────────────────────────
let chartDrawn = false;
const screenTrees = document.getElementById("screen-trees");

const chartObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !chartDrawn) {
      chartDrawn = true;
      drawTreeChart("#chart-trees");
      chartObserver.disconnect();
    }
  },
  { threshold: 0.3 }
);

if (screenTrees) chartObserver.observe(screenTrees);

// ── Carte eucalyptus (écran 4) ───────────────────────────────────
let mapInited = false;
const screenMap = document.getElementById("screen-map");

const mapObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !mapInited) {
      mapInited = true;
      setTimeout(() => initEucalyptusMap("map-eucalyptus"), 200);
      mapObserver.disconnect();
    }
  },
  { threshold: 0.2 }
);

if (screenMap) mapObserver.observe(screenMap);
