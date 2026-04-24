import "./css/style.css";
import { drawTreeChart }           from "./modules/tree-chart.js";
import { drawConcentrationChart }  from "./modules/chart-concentration.js";
import { initParisComparison }     from "./modules/comparison-paris.js";
import { initEucalyptusMap }       from "./modules/eucalyptus-map.js";
import { drawFireTimeline }  from "./modules/fire-chart.js";
import { initFireMap, updateFireYear } from "./modules/fire-map.js";

const mainScroll = document.getElementById("main-scroll");
const progressBar = document.getElementById("scroll-progress-bar");

// Positions absolues de chaque section dans le conteneur de scroll
function getSectionPositions() {
  return Array.from(mainScroll.querySelectorAll(".hero-part"))
    .map(el => Math.round(el.getBoundingClientRect().top + mainScroll.scrollTop));
}

let scrollLocked = false;

function navigateTo(direction) {
  if (scrollLocked) return;

  const cur       = mainScroll.scrollTop;
  const positions = getSectionPositions();

  const target = direction === "down"
    ? positions.find(p => p > cur + 5)
    : positions.filter(p => p < cur - 5).at(-1);

  if (target === undefined) return;

  scrollLocked = true;
  mainScroll.scrollTo({ top: target, behavior: "smooth" });
  setTimeout(() => { scrollLocked = false; }, 700);
}

// Molette — saute de section en section, sauf si on est sur la carte (zoom MapLibre)
mainScroll.addEventListener("wheel", (e) => {
  const mapEl = document.getElementById("map-eucalyptus");
  if (mapEl && mapEl.contains(e.target)) return; // MapLibre gère le zoom lui-même

  e.preventDefault();
  navigateTo(e.deltaY > 0 ? "down" : "up");
}, { passive: false });

mainScroll.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

// Flèches clavier
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); navigateTo("down"); }
  if (e.key === "ArrowUp")   { e.preventDefault(); navigateTo("up");   }
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
// Comparaison Ronaldo/Stade (Section 1)
// ─────────────────────────────────────────────────────────────
const comparisonTrigger = document.getElementById("comparison-trigger");
const stickyHero        = document.querySelector(".sticky-hero");

const comparisonObserver = new IntersectionObserver(
  (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      if (stickyHero) stickyHero.classList.add("chart-active");
    } else {
      if (entry.boundingClientRect.top > 0) {
        if (stickyHero) stickyHero.classList.remove("chart-active");
      } else {
        if (stickyHero) stickyHero.classList.add("chart-active");
      }
    }
  },
  { root: mainScroll, threshold: 0 }
);

if (comparisonTrigger) comparisonObserver.observe(comparisonTrigger);

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
// Graphique D3 (arbres) — dessiné quand la section entre dans le snap
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
// Graphique D3 (concentration) — dessiné quand la section entre dans le snap
// ─────────────────────────────────────────────────────────────
let concentrationDrawn = false;
const concentrationTrigger = document.getElementById("concentration-trigger");
const stickyConcentration  = document.querySelector(".sticky-concentration");

const concentrationObserver = new IntersectionObserver(
  (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      if (stickyConcentration) stickyConcentration.classList.add("chart-active");
      if (!concentrationDrawn) {
        concentrationDrawn = true;
        drawConcentrationChart("#chart-concentration");
      }
    } else {
      if (entry.boundingClientRect.top > 0) {
        if (stickyConcentration) stickyConcentration.classList.remove("chart-active");
      } else {
        if (stickyConcentration) stickyConcentration.classList.add("chart-active");
      }
    }
  },
  { root: mainScroll, threshold: 0 }
);

if (concentrationTrigger) concentrationObserver.observe(concentrationTrigger);

// ─────────────────────────────────────────────────────────────
// Comparaison Paris (Section 3.5)
// ─────────────────────────────────────────────────────────────
const parisTrigger = document.getElementById("paris-trigger");
let parisInited = false;

const parisObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !parisInited) {
      parisInited = true;
      initParisComparison();
      parisObserver.disconnect();
    }
  },
  { root: mainScroll, threshold: 0.1 }
);

if (parisTrigger) parisObserver.observe(parisTrigger);

// ─────────────────────────────────────────────────────────────
// Carte MapLibre — initialisée quand la section entre dans le snap
// ─────────────────────────────────────────────────────────────
let mapInited = false;
const mapTrigger = document.getElementById("map-trigger");
const stickyMap  = document.querySelector(".sticky-map");

const mapObserver = new IntersectionObserver(
  (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      if (stickyMap) stickyMap.classList.add("chart-active");
      if (!mapInited) {
        mapInited = true;
        setTimeout(() => initEucalyptusMap("map-eucalyptus"), 150);
      }
    } else {
      if (entry.boundingClientRect.top > 0) {
        if (stickyMap) stickyMap.classList.remove("chart-active");
      } else {
        if (stickyMap) stickyMap.classList.add("chart-active");
      }
    }
  },
  { root: mainScroll, threshold: 0 }
);

if (mapTrigger) mapObserver.observe(mapTrigger);
if (screenMap) mapObserver.observe(screenMap);

// ─────────────────────────────────────────────────────────────
// Graphique historique des incendies
// ─────────────────────────────────────────────────────────────
let fireChartDrawn    = false;
const screenFireChart = document.getElementById("screen-fire-chart");

const fireChartObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !fireChartDrawn) {
      fireChartDrawn = true;
      drawFireTimeline("#chart-fires");
      fireChartObserver.disconnect();
    }
  },
  { root: mainScroll, threshold: 0.2 }
);

if (screenFireChart) fireChartObserver.observe(screenFireChart);

// ─────────────────────────────────────────────────────────────
// Carte heatmap des incendies
// ─────────────────────────────────────────────────────────────
let fireMapInited    = false;
const screenFireMap  = document.getElementById("screen-fire-map");

const fireMapObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !fireMapInited) {
      fireMapInited = true;
      setTimeout(() => initFireMap("map-fires"), 150);
      fireMapObserver.disconnect();
    }
  },
  { root: mainScroll, threshold: 0.05 } // Déclenchement plus tôt
);

if (screenFireMap) fireMapObserver.observe(screenFireMap);
