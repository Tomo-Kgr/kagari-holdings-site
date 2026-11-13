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

function enableHeroCarousel() {
  const hero = document.querySelector("[data-hero-carousel]");
  if (!hero) return;
  const slides = [...hero.querySelectorAll("[data-hero-slide]")];
  const failed = new Set();
  const loading = new Map();
  let current = 0;
  let paused = reducedMotion.matches || !!navigator.connection?.saveData;
  let visible = true;
  let ready = false;
  let timer;
  let preloadTimer;
  let request = 0;
  const canRun = () => ready && !paused && visible && !document.hidden;

  function nextIndex() {
    for (let offset = 1; offset < slides.length; offset++) {
      const index = (current + offset) % slides.length;
      if (!failed.has(index)) return index;
    }
    return current;
  }

  function prepare(index) {
    if (loading.has(index)) return loading.get(index);
    const slide = slides[index];
    const template = slide.querySelector("template");
    if (template) {
      slide.append(template.content.cloneNode(true));
      template.remove();
    }
    const image = slide.querySelector("img");
    const promise = image
      .decode()
      .then(() => true)
      .catch(() => {
        failed.add(index);
        loading.delete(index);
        return false;
      });
    loading.set(index, promise);
    return promise;
  }

  function clearTimers() {
    clearTimeout(timer);
    clearTimeout(preloadTimer);
  }

  function schedule() {
    clearTimers();
    if (!canRun() || nextIndex() === current) return;
    // Decode just the next photo after the initial image and text have loaded.
    preloadTimer = setTimeout(() => prepare(nextIndex()), 1500);
    timer = setTimeout(() => showSlide(nextIndex()), 3000);
  }

  function updateMotionPreference() {
    paused = reducedMotion.matches || !!navigator.connection?.saveData;
    request++;
    hero.dataset.paused = String(paused);
    schedule();
  }

  async function showSlide(index) {
    clearTimers();
    const ticket = ++request;
    const loaded = await prepare(index);
    if (ticket !== request) return;
    if (!loaded || !canRun()) {
      schedule();
      return;
    }
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });
    current = index;
    hero.dataset.slide = String(index);
    schedule();
  }

  document.addEventListener("visibilitychange", schedule);
  reducedMotion.addEventListener("change", updateMotionPreference);
  navigator.connection?.addEventListener("change", updateMotionPreference);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        schedule();
      },
      { threshold: 0.1 },
    ).observe(hero);
  }
  hero.dataset.slide = "0";
  hero.dataset.paused = String(paused);
  firstImageReady.then(() => {
    ready = true;
    schedule();
  });
}

enableHeroCarousel();

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
