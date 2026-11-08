import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const pages = [];
async function collect(dir) {
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    if (
      item.name.startsWith(".") ||
      ["dist", "node_modules"].includes(item.name)
    )
      continue;
    const file = path.join(dir, item.name);
    if (item.isDirectory()) await collect(file);
    else if (item.name === "index.html") pages.push(file);
  }
}
await collect(root);
const home = await fs.readFile(path.join(root, "index.html"), "utf8");
const philosophy = await fs.readFile(
  path.join(root, "philosophy/index.html"),
  "utf8",
);
const statements = [
  "日本に息づく知恵・技術・心を次代へ紡ぎ、日本を照らし続ける篝火となる",
  "企業と産業の変革を通じて、強くしなやかな日本を実現する",
];
for (const statement of statements) {
  assert.ok(
    home.includes(statement),
    "Home statement must match the approved copy",
  );
  assert.ok(
    philosophy.includes(statement),
    "Philosophy statement must match the approved copy",
  );
}
assert.equal(
  home.match(/<ol class="promise-list">[\s\S]*?<\/ol>/)[0],
  philosophy.match(/<ol class="promise-list">[\s\S]*?<\/ol>/)[0],
  "Promises must match on both pages",
);
const titles = new Set();
for (const file of pages) {
  const html = await fs.readFile(file, "utf8");
  assert.ok(!/【要確認[^】]*】/.test(html), `Unconfirmed content in ${file}`);
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) || []).length,
    1,
    `One H1 required: ${file}`,
  );
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `Unique title required: ${file}`);
  titles.add(title);
  if (file.includes(`${path.sep}investment-themes${path.sep}`)) continue;
  assert.ok(
    html.includes('name="description"'),
    `Missing description: ${file}`,
  );
  assert.ok(html.includes('property="og:image"'), `Missing OGP: ${file}`);
  assert.ok(
    html.includes('name="twitter:card"'),
    `Missing Twitter Card: ${file}`,
  );
  const schema = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
  );
  assert.equal(schema.name, "篝ホールディングス株式会社");
  assert.ok(schema.address && schema.logo && schema.url);
  assert.ok(
    !html.includes('href="/recruit/"') &&
      !html.includes('href="/group/"') &&
      !html.includes('href="/case-studies/"'),
    `Unpublished navigation: ${file}`,
  );
  for (const match of html.matchAll(
    /(?:src|href)="(\/assets\/[^"?]+)(?:\?[^\"]*)?"/g,
  ))
    await fs.access(path.join(root, match[1]));
}
for (const page of ["recruit", "group", "case-studies"])
  assert.ok(
    (await fs.readFile(path.join(root, page, "index.html"), "utf8")).includes(
      'content="noindex, follow"',
    ),
  );
const sitemap = await fs.readFile(path.join(root, "sitemap.xml"), "utf8");
assert.ok(
  sitemap.includes("/philosophy/") &&
    sitemap.includes("/investment-policy/") &&
    sitemap.includes("/news/"),
);
assert.ok(
  !sitemap.includes("/investment-themes/") && !sitemap.includes("/recruit/"),
);
const config = JSON.parse(
  await fs.readFile(path.join(root, "vercel.json"), "utf8"),
);
assert.ok(
  config.redirects.some(
    (r) => r.source === "/investment-themes/:path*" && r.permanent,
  ),
);
console.log(
  `Content, metadata, publication boundaries and assets verified across ${pages.length} routes.`,
);
