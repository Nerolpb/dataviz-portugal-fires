import "./css/style.css";

const slider = document.getElementById("slider-container");
const screens = document.querySelectorAll(".screen");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
let current = 0;

function updateNav() {
  btnPrev.disabled = current === 0;
  btnNext.disabled = current === screens.length - 1;
}

function goTo(index) {
  if (index < 0 || index >= screens.length) return;
  current = index;
  slider.style.transform = `translateX(-${current * 100}vw)`;
  updateNav();
}

// Navigation clavier (flèches)
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") goTo(current + 1);
  if (e.key === "ArrowLeft") goTo(current - 1);
});

// Boutons flèches
btnPrev.addEventListener("click", () => goTo(current - 1));
btnNext.addEventListener("click", () => goTo(current + 1));

// Bouton CTA (écran 1)
document.getElementById("btn-start")?.addEventListener("click", () => {
  goTo(current + 1);
});

// État initial
updateNav();
