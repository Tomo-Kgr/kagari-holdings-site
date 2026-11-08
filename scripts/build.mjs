import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const preview = process.argv.includes("--preview");
const routes = [
  "",
  "business",
  "consulting",
  "philosophy",
  "investment-policy",
  "investment-themes",
  "value-up",
  "team",
  "process",
  "contact",
  "contact/owners",
  "contact/consulting",
  "contact/advisors",
  "contact/general",
  "group",
  "case-studies",
  "news",
  "recruit",
  "privacy-policy",
  "koukoku",
];
const pending = [];
for (const route of routes) {
  const file = path.join(route, "index.html");
  const html = await fs.readFile(path.join(root, file), "utf8");
  const markers = [...new Set(html.match(/【要確認[^】]*】/g) || [])];
  if (markers.length) pending.push(`${file}: ${markers.join(" ")}`);
}
if (!preview && pending.length) {
  console.error(
    "Release blocked: confirm all pending facts before publishing.\n" +
      pending.join("\n"),
  );
  process.exit(1);
}

// An explicit allowlist keeps drafts, source documents and review reports out of production.
const destination = path.resolve(root, preview ? ".review/site" : "dist");
const relative = path.relative(root, destination);
if (!relative || relative.startsWith("..") || path.isAbsolute(relative))
  throw new Error("Invalid build destination");
await fs.rm(destination, { recursive: true, force: true });
await fs.mkdir(destination, { recursive: true });
const copy = async (from, to = from) => {
  await fs.mkdir(path.dirname(path.join(destination, to)), { recursive: true });
  await fs.cp(path.join(root, from), path.join(destination, to), {
    recursive: true,
  });
};
const css = (
  await Promise.all(
    ["styles", "editorial"].map((name) =>
      fs.readFile(path.join(root, `assets/css/${name}.css`), "utf8"),
    ),
  )
).join("\n");
const cssName = `site-${crypto.createHash("sha256").update(css).digest("hex").slice(0, 12)}.css`;
for (const route of routes) {
  const file = path.join(route, "index.html");
  let html = await fs.readFile(path.join(root, file), "utf8");
  const fontHref = html.match(/href="(\/assets\/css\/fonts\.css[^\"]*)"/)?.[1];
  html = html.replace(/\s*<link\s+rel="preload"\s+as="font"[^>]*>/g, "");
  let bundled = false;
  html = html.replace(
    /<link\s+rel="stylesheet"\s+href="\/assets\/css\/(?:fonts|styles|editorial)\.css[^\"]*"[^>]*>/g,
    () => {
      if (bundled) return "";
      bundled = true;
      return `<link rel="stylesheet" href="/assets/css/${cssName}" />${fontHref ? `<noscript><link rel="stylesheet" href="${fontHref}" /></noscript>` : ""}`;
    },
  );
  html = html.replace(
    /(<link\s+rel="preload"\s+as="image")/,
    '$1 fetchpriority="high"',
  );
  await fs.mkdir(path.dirname(path.join(destination, file)), {
    recursive: true,
  });
  await fs.writeFile(path.join(destination, file), html);
}
for (const file of [
  "assets/css",
  "assets/js",
  "assets/images",
  "favicon.png",
  "favicon.svg",
  "site.webmanifest",
  "robots.txt",
  "sitemap.xml",
])
  await copy(file);
await fs.writeFile(path.join(destination, "assets/css", cssName), css);
for (const file of await fs.readdir(path.join(root, "assets/fonts"))) {
  if (file.endsWith(".woff2") || file.endsWith(".txt"))
    await copy(`assets/fonts/${file}`);
}
if (preview)
  await copy(".drafts/recruit/index.html", "draft-recruit/index.html");
console.log(`${preview ? "Local review" : "Production"} build: ${destination}`);
if (pending.length)
  console.log(`Pending checks retained in review: ${pending.length} pages.`);
