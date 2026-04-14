import "./css/style.css";
import { drawTreeChart } from "./modules/tree-chart.js";
import { initEucalyptusMap } from "./modules/eucalyptus-map.js";

const slider = document.getElementById("slider-container");
const screens = document.querySelectorAll(".screen");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const screenTrees = document.getElementById("screen-trees");
let current = 0;

function updateNav() {
  btnPrev.disabled = current === 0;
  btnNext.disabled = current === screens.length - 1;
}

function activateScreen3() {
  screenTrees.classList.add("screen--active");
  setTimeout(() => {
    screenTrees.classList.add("screen--chart-visible");
    drawTreeChart("#chart-trees");
  }, 700);
}

function resetScreen3() {
  screenTrees.classList.remove("screen--active", "screen--chart-visible");
}

function goTo(index) {
  if (index < 0 || index >= screens.length) return;
  if (current === 2 && index !== 2) resetScreen3();
  current = index;
  slider.style.transform = `translateY(-${current * 100}vh)`;
  updateNav();
  if (index === 2) activateScreen3();
  if (index === 3) setTimeout(() => initEucalyptusMap("map-eucalyptus"), 750);
}

// Navigation clavier (flèches)
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") goTo(current + 1);
  if (e.key === "ArrowUp") goTo(current - 1);
});

// Boutons flèches
btnPrev.addEventListener("click", () => goTo(current - 1));
btnNext.addEventListener("click", () => goTo(current + 1));

// Bouton CTA (écran 1)
document.getElementById("btn-start")?.addEventListener("click", () => {
  goTo(current + 1);
});

// Molette souris — ignorée si le scroll vient de la carte
const mapContainer = document.getElementById("map-eucalyptus");
let wheelLocked = false;
document.addEventListener("wheel", (e) => {
  if (mapContainer?.contains(e.target)) return;
  if (wheelLocked) return;
  wheelLocked = true;
  if (e.deltaY > 0) goTo(current + 1);
  else goTo(current - 1);
  setTimeout(() => { wheelLocked = false; }, 900);
});

// État initial
updateNav();
