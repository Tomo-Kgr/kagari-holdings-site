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
for (const [html, className] of [
  [home, "principles-summary-list"],
  [philosophy, "principles-detail-list"],
]) {
  const list = html.match(
    new RegExp(`<ol class="${className}">[\\s\\S]*?</ol>`),
  )?.[0];
  assert.ok(list, `Missing ${className}`);
  assert.equal(
    (list.match(/<li>/g) || []).length,
    5,
    "Five corporate principles required",
  );
  assert.ok(
    !html.includes("行動方針") && !html.includes("十箇条"),
    "Internal guidelines must not be published",
  );
}
assert.ok(home.includes('href="/philosophy/#principles"'));
for (const clause of [
  "当社は、日本を強く、豊かにするために存在します。",
  "投資判断の責任も、現場でともに汗をかく責任も、すべて当社が負います。",
  "何より群を抜く誠実さをもって",
  "生み出した成果に対する正当な還元を約束します。",
  "世界に認められるブランドと実力を持つ投資会社へと前進し続けます。",
  "国際情勢が揺らぎ、エネルギーや原材料の確保さえ当たり前ではなくなった今",
])
  assert.ok(
    philosophy.includes(clause),
    `Missing approved MVV copy: ${clause}`,
  );
for (const html of [home, philosophy]) {
  assert.equal((html.match(/data-hero-slide\s/g) || []).length, 5);
  assert.ok(html.includes('class="hero-slide hero-slide--kagaribi is-active"'));
  assert.ok(
    !/data-hero-select|data-hero-playback|photo-credit|industry-gallery/.test(
      html,
    ),
  );
  assert.ok(html.includes('href="/privacy-policy/#images"'));
}
const privacy = await fs.readFile(
  path.join(root, "privacy-policy/index.html"),
  "utf8",
);
assert.ok(privacy.includes('id="images"') && privacy.includes("AI生成画像"));
for (const credit of [
  "Joris Beugels",
  "gumigasuki",
  "Dennis Peterson",
  "W Luna",
  "Alexey Demidov",
])
  assert.ok(privacy.includes(credit), `Missing photo credit: ${credit}`);
const policy = await fs.readFile(
  path.join(root, "investment-policy/index.html"),
  "utf8",
);
const featurePattern =
  /<!-- industry-features:start -->[\s\S]*?<!-- industry-features:end -->/;
const normalizeFeature = (html) =>
  html
    .match(featurePattern)[0]
    .replace(/<\/?h[234][^>]*>/g, "")
    .replace(/\s+/g, " ");
assert.equal(
  normalizeFeature(home),
  normalizeFeature(policy),
  "Sector explanations must stay in sync",
);
for (const html of [home, policy]) {
  assert.equal((html.match(/class="industry-feature"/g) || []).length, 3);
  assert.equal((html.match(/市場・商習慣の特徴/g) || []).length, 3);
  assert.equal((html.match(/篝が着目する理由/g) || []).length, 3);
}
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
