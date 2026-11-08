const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");
const revealTargets = document.querySelectorAll(".reveal");
const menuBreakpoint = window.matchMedia("(max-width: 1280px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function loadReadingFonts() {
  if (document.querySelector('link[href*="/assets/css/fonts.css"]')) return;
  const script = document.querySelector('script[src*="/assets/js/main.js"]');
  const url = new URL("../css/fonts.css", script.src);
  url.search = new URL(script.src).search;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url.href;
  document.head.append(link);
}

// Keep full Japanese font files from competing with the first-viewport photograph.
const heroImage = document.querySelector(".hero-image");
const firstImageReady = heroImage
  ? heroImage.decode().catch(() => {})
  : Promise.resolve();
firstImageReady.then(() =>
  requestAnimationFrame(() => requestAnimationFrame(loadReadingFonts)),
);

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
  navToggle.setAttribute(
    "aria-label",
    isOpen ? "メニューを閉じる" : "メニューを開く",
  );
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
  let previousHeight = window.matchMedia("(max-width: 640px)").matches
    ? 80
    : 88;
  new ResizeObserver((entries) => {
    const height = entries[0].borderBoxSize?.[0]?.blockSize;
    if (height && Math.abs(height - previousHeight) > 0.5) {
      previousHeight = height;
      document.documentElement.style.setProperty(
        "--header-height",
        `${height}px`,
      );
    }
  }).observe(header);
}

function enableReveals() {
  if (!("IntersectionObserver" in window) || reducedMotion.matches) return;
  // Content stays visible even if a fast scroll skips an observer callback.
  const offscreen = [...revealTargets].filter(
    (target) => target.getBoundingClientRect().top > window.innerHeight,
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!reducedMotion.matches)
            entry.target.animate([{ opacity: 0.65 }, { opacity: 1 }], {
              duration: 350,
              easing: "ease-out",
            });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0 },
  );

  offscreen.forEach((target) => {
    observer.observe(target);
  });
}

window.addEventListener(
  "load",
  () => {
    if ("requestIdleCallback" in window) requestIdleCallback(enableReveals);
    else setTimeout(enableReveals, 100);
  },
  { once: true },
);
