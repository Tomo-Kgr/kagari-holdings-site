import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const routes = [
  "",
  "philosophy",
  "business",
  "consulting",
  "investment-policy",
  "team",
  "contact",
  "news",
  "koukoku",
  "privacy-policy",
];
const retired = [
  "process",
  "value-up",
  "contact/owners",
  "contact/consulting",
  "contact/advisors",
  "contact/general",
];
const config = JSON.parse(
  await fs.readFile(path.join(root, "vercel.json"), "utf8"),
);
const sitemap = await fs.readFile(path.join(root, "sitemap.xml"), "utf8");
const forbidden =
  /中小企業|中堅|買収|社員の皆様|優良|よくあるご質問|写真・画像について|食・観光/;
let links = 0;
for (const route of routes) {
  const file = path.join(root, route, "index.html");
  const html = await fs.readFile(file, "utf8");
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${route}: one h1`);
  assert(html.includes('<main id="main">'), `${route}: landmark`);
  assert(
    !/【要確認|Coming Soon|localhost|SharePoint|03_画像/.test(html),
    `${route}: unpublished material`,
  );
  assert(
    html.includes("kagari-og-20261119.png"),
    `${route}: current social image`,
  );
  assert(html.includes("Tokyo, Japan"), `${route}: footer`);
  assert(html.includes('rel="canonical"'), `${route}: canonical`);
  // These passages remain verbatim pending the representative's approval.
  const currentOnly = html
    .replace(
      /<div[^>]*data-preserved="(?:home-message|team-message|biography)"[^>]*>[\s\S]*?<\/div>/g,
      "",
    )
    .replace(
      /<span[^>]*data-preserved="consulting-biography"[^>]*>[\s\S]*?<\/span>/g,
      "",
    );
  assert(
    !forbidden.test(currentOnly),
    `${route}: retired wording outside preserved passages`,
  );
  for (const match of html.matchAll(
    /(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g,
  )) {
    const url = match[1];
    assert(
      !retired.some((r) => url === `/${r}/` || url === `/${r}`),
      `${route}: retired link ${url}`,
    );
    const target = url.endsWith("/") ? url + "index.html" : url;
    await fs.access(path.join(root, target));
    links++;
  }
  assert(
    sitemap.includes(
      `https://kagariholdings.com/${route ? route + "/" : ""}</loc>`,
    ),
    `${route}: sitemap`,
  );
}
for (const route of retired) {
  const rule = config.redirects.find((r) => r.source === `/${route}/:path*`);
  assert.equal(rule?.statusCode, 301, `${route}: permanent 301`);
  assert.equal(
    rule.destination,
    route.startsWith("contact/") ? "/contact" : "/business",
  );
  assert(!sitemap.includes(`/${route}/`), `${route}: absent from sitemap`);
}
const policy = await fs.readFile(
  path.join(root, "investment-policy/index.html"),
  "utf8",
);
assert(policy.includes("自己資金と金融機関からの借入"));
assert(!/取得比率|EBITDA|4億|三産業/.test(policy));
const home = await fs.readFile(path.join(root, "index.html"), "utf8");
assert(home.includes("強くしなやかな日本"));
assert(home.includes("kagaribi-shrine-1680.webp"));
assert(!home.includes("data-hero-carousel"));
const privacy = await fs.readFile(
  path.join(root, "privacy-policy/index.html"),
  "utf8",
);
assert(!privacy.includes('id="images"'));
for (const route of ["group", "case-studies", "recruit"]) {
  const html = await fs.readFile(path.join(root, route, "index.html"), "utf8");
  assert(html.includes("noindex"), `${route}: unpublished`);
  assert(!sitemap.includes(`/${route}/`));
}
await fs.access(path.join(root, "assets/images/kagari-og-20261119.png"));
await fs.access(path.join(root, "assets/fonts/Cinzel-OFL.txt"));
console.log(
  `Site checks passed: ${routes.length} public pages, ${links} local references, ${retired.length} redirects. Preserved representative passages are explicit wording exceptions.`,
);
