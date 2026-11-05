import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const preview = process.argv.includes("--preview");
const routes = ["", "business", "consulting", "investment-themes", "value-up", "team", "process", "contact", "contact/owners", "contact/consulting", "contact/advisors", "contact/general", "group", "case-studies", "news", "recruit", "privacy-policy", "koukoku"];
const pending = [];
for (const route of routes) {
  const file = path.join(route, "index.html");
  const html = await fs.readFile(path.join(root, file), "utf8");
  const markers = [...new Set(html.match(/【要確認#[0-9]+】/g) || [])];
  if (markers.length) pending.push(`${file}: ${markers.join(" ")}`);
}
if (!preview && pending.length) {
  console.error("Release blocked: confirm all pending facts before publishing.\n" + pending.join("\n"));
  process.exit(1);
}

// An explicit allowlist keeps drafts, source documents and review reports out of production.
const destination = path.resolve(root, preview ? ".review/site" : "dist");
const relative = path.relative(root, destination);
if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Invalid build destination");
await fs.rm(destination, { recursive: true, force: true });
await fs.mkdir(destination, { recursive: true });
const copy = async (from, to = from) => {
  await fs.mkdir(path.dirname(path.join(destination, to)), { recursive: true });
  await fs.cp(path.join(root, from), path.join(destination, to), { recursive: true });
};
for (const route of routes) await copy(path.join(route, "index.html"));
for (const file of ["assets/css", "assets/js", "assets/images", "favicon.png", "favicon.svg", "site.webmanifest", "robots.txt", "sitemap.xml"]) await copy(file);
for (const file of await fs.readdir(path.join(root, "assets/fonts"))) {
  if (file.endsWith(".woff2") || file.endsWith(".txt")) await copy(`assets/fonts/${file}`);
}
if (preview) await copy(".drafts/recruit/index.html", "draft-recruit/index.html");
console.log(`${preview ? "Local review" : "Production"} build: ${destination}`);
if (pending.length) console.log(`Pending checks retained in review: ${pending.length} pages.`);
