const header = document.querySelector("[data-header]");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");
const breakpoint = window.matchMedia("(max-width: 1100px)");

function loadFonts() {
  if (document.querySelector('link[href*="/assets/css/fonts.css"]')) return;
  const script = document.querySelector('script[src*="/assets/js/main.js"]');
  const url = new URL("../css/fonts.css", script.src);
  url.search = new URL(script.src).search;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url.href;
  document.head.append(link);
}
const hero = document.querySelector(".hero-image");
(hero ? hero.decode().catch(() => {}) : Promise.resolve()).then(loadFonts);

function closeMenu() {
  header.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "メニューを開く");
}
toggle.addEventListener("click", () => {
  const open = header.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute(
    "aria-label",
    open ? "メニューを閉じる" : "メニューを開く",
  );
});
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && header.classList.contains("is-open")) {
    closeMenu();
    toggle.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) closeMenu();
});
header.addEventListener("focusout", (event) => {
  if (event.relatedTarget && !header.contains(event.relatedTarget)) closeMenu();
});
breakpoint.addEventListener("change", closeMenu);
for (const link of nav.querySelectorAll("a")) {
  if (
    new URL(link.href).pathname.replace(/\/$/, "") ===
    location.pathname.replace(/\/$/, "")
  )
    link.setAttribute("aria-current", "page");
}
// Anchor offsets follow the collapsed header, not the expanded mobile menu.
new ResizeObserver(() => {
  if (!header.classList.contains("is-open")) {
    document.documentElement.style.setProperty(
      "--header-height",
      `${header.getBoundingClientRect().height}px`,
    );
  }
}).observe(header);
