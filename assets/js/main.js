const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");
const revealTargets = document.querySelectorAll(".reveal");
const menuBreakpoint = window.matchMedia("(max-width: 1180px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

function closeMenu() {
  header.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "メニューを開く");
}

navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
});

nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && header.classList.contains("is-open")) {
    closeMenu();
    navToggle.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) closeMenu();
});

header.addEventListener("focusout", (event) => {
  if (event.relatedTarget && !header.contains(event.relatedTarget)) closeMenu();
});

menuBreakpoint.addEventListener("change", closeMenu);

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("pageshow", updateHeader);
closeMenu();

if ("ResizeObserver" in window) {
  let previousHeight = window.matchMedia("(max-width: 640px)").matches ? 80 : 88;
  new ResizeObserver((entries) => {
    const height = entries[0].borderBoxSize?.[0]?.blockSize;
    if (height && Math.abs(height - previousHeight) > 0.5) {
      previousHeight = height;
      document.documentElement.style.setProperty("--header-height", `${height}px`);
    }
  }).observe(header);
}

function enableReveals() {
  if (!("IntersectionObserver" in window) || reducedMotion.matches) return;
  // Animate only offscreen content after the first render; never hide a visible heading.
  const offscreen = [...revealTargets].filter(target => target.getBoundingClientRect().top > window.innerHeight);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  offscreen.forEach((target) => {
    target.classList.add("will-reveal");
    observer.observe(target);
  });
}

window.addEventListener("load", () => {
  if ("requestIdleCallback" in window) requestIdleCallback(enableReveals);
  else setTimeout(enableReveals, 100);
}, { once: true });
