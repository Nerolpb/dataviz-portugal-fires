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
  return Array.from(mainScroll.querySelectorAll(".hero-part, .snap-section"))
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
  const mapEucy  = document.getElementById("map-eucalyptus");
  const mapFires = document.getElementById("map-fires");
  if (mapEucy  && mapEucy.contains(e.target))  return;
  if (mapFires && mapFires.contains(e.target)) return;

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
// Bouton retour au début
// ─────────────────────────────────────────────────────────────
document.getElementById("btn-restart").addEventListener("click", () => {
  mainScroll.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("btn-end").addEventListener("click", () => {
  mainScroll.scrollTo({ top: mainScroll.scrollHeight, behavior: "smooth" });
});

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

document.getElementById("btn-map-next")?.addEventListener("click", () => {
  const next = document.getElementById("section-bridge");
  if (!next) return;
  const top = next.getBoundingClientRect().top + mainScroll.scrollTop;
  mainScroll.scrollTo({ top, behavior: "smooth" });
});

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

// Copie du graphique (screen-fire-chart-2)
let fireChartDrawn2    = false;
const screenFireChart2 = document.getElementById("screen-fire-chart-2");

const fireChartObserver2 = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !fireChartDrawn2) {
      fireChartDrawn2 = true;
      drawFireTimeline("#chart-fires-2");
      fireChartObserver2.disconnect();
    }
  },
  { root: mainScroll, threshold: 0.2 }
);

if (screenFireChart2) fireChartObserver2.observe(screenFireChart2);

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

// ─────────────────────────────────────────────────────────────
// Histoire 2017 — scroll storytelling (4 étapes, position-based)
// ─────────────────────────────────────────────────────────────
const story2017Group  = document.getElementById("story-2017-group");
const story2017Sticky = document.querySelector(".s17-sticky");

if (story2017Group && story2017Sticky) {
  function updateStory2017Step() {
    const top = story2017Group.getBoundingClientRect().top;
    const vh  = mainScroll.clientHeight;
    const scrolledInto = -top;

    let step = 0;
    if (scrolledInto >= 0)        step = 1;
    if (scrolledInto >= vh)       step = 2;
    if (scrolledInto >= vh * 2)   step = 3;
    if (scrolledInto >= vh * 3)   step = 4;

    if (story2017Sticky.dataset.step !== String(step)) {
      story2017Sticky.dataset.step = step;
    }
  }

  mainScroll.addEventListener("scroll", updateStory2017Step, { passive: true });
  updateStory2017Step();
}

// ─────────────────────────────────────────────────────────────
// Section noire — révélation par groupe via IntersectionObserver
// ─────────────────────────────────────────────────────────────
document.querySelectorAll(".black-trigger").forEach(trigger => {
  const obs = new IntersectionObserver(
    (entries) => {
      const entry  = entries[0];
      const group  = parseInt(trigger.dataset.group);

      if (entry.isIntersecting) {
        // Scroll vers le bas : affiche les images du groupe
        document.querySelectorAll(`.fire-reveal[data-group="${group}"]`)
          .forEach(img => img.classList.add("visible"));
      } else if (entry.boundingClientRect.top > 0) {
        // Trigger repassé en dessous du viewport : l'utilisateur est remonté
        // On retire les images de ce groupe et de tous les groupes suivants
        document.querySelectorAll(".fire-reveal[data-group]").forEach(img => {
          if (parseInt(img.dataset.group) >= group) {
            img.classList.remove("visible");
          }
        });
      }
    },
    { root: mainScroll, threshold: 0 }
  );
  obs.observe(trigger);
});
