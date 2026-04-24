export function initHeroStorytelling() {
  const scrollContainer = document.getElementById("main-scroll");
  const heroSection = document.getElementById("screen-hero");
  const stickyContainer = document.getElementById("comparison-sticky");

  if (!heroSection || !scrollContainer || !stickyContainer) return;

  scrollContainer.addEventListener("scroll", () => {
    const sectionTop = heroSection.offsetTop;
    const sectionHeight = heroSection.offsetHeight;
    const scrollTop = scrollContainer.scrollTop;
    
    const relativeScroll = scrollTop - sectionTop;
    const progress = Math.min(Math.max(relativeScroll / (sectionHeight - window.innerHeight), 0), 1);

    // Transition ultra-réactive sur 150vh
    // On déclenche le mouvement dès le début du scroll (10%)
    if (progress > 0.1) {
      stickyContainer.classList.add("comparison-active");
    } else {
      stickyContainer.classList.remove("comparison-active");
    }
  });
}
