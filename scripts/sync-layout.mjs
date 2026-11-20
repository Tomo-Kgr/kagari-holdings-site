import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const version = "20261119-r1";
let home = await fs.readFile(path.join(root, "index.html"), "utf8");
// Navigation and organization metadata stay shared; each page owns its content.
const header = home.match(/<header class="site-header"[\s\S]*?<\/header>/)[0];
const footer = home.match(/<footer class="site-footer"[\s\S]*?<\/footer>/)[0];
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "篝ホールディングス株式会社",
  alternateName: "Kagari Holdings Co., Ltd.",
  url: "https://kagariholdings.com/",
  email: "info@kagariholdings.com",
  logo: "https://kagariholdings.com/assets/images/kagari-mark-192.png",
  foundingDate: "2026-07-14",
  address: {
    "@type": "PostalAddress",
    addressCountry: "JP",
    addressRegion: "東京都",
    addressLocality: "千代田区",
    streetAddress: "神田神保町三丁目11番6号神保町ビル10階",
    postalCode: "101-0051",
  },
};
const files = [];
async function collect(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (
      entry.name.startsWith(".") ||
      ["dist", "node_modules"].includes(entry.name)
    )
      continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await collect(file);
    else if (entry.name === "index.html") files.push(file);
  }
}
await collect(root);
const escape = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;");
for (const file of files) {
  let html = await fs.readFile(file, "utf8");
  if (html.includes('http-equiv="refresh"')) continue;
  if (!html.includes("document.documentElement.classList.add"))
    html = html.replace(
      "<head>",
      '<head>\n<script>document.documentElement.classList.add("js");</script>',
    );
  html = html
    .replace(/<header class="site-header"[\s\S]*?<\/header>/, header)
    .replace(/<footer class="site-footer"[\s\S]*?<\/footer>/, footer)
    .replaceAll("/investment-themes/", "/investment-policy/")
    .replaceAll("投資テーマ", "投資方針")
    .replace(
      /(assets\/(?:css\/(?:fonts|styles|editorial)\.css|js\/main\.js))\?v=[^" ]+/g,
      `$1?v=${version}`,
    );
  if (!html.includes("/assets/css/editorial.css"))
    html = html.replace(
      /(<link rel="stylesheet" href="\/assets\/css\/styles.css[^>]+>)/,
      `$1\n  <link rel="stylesheet" href="/assets/css/editorial.css?v=${version}" />`,
    );
  html = html.replace(
    /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
    "",
  );
  html = html.replace(
    /\s*<meta\s+(?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>/g,
    "",
  );
  const title = html.match(/<title>([^<]+)<\/title>/)[1];
  const description = html.match(/name="description"\s+content="([^"]*)"/)[1];
  const url = html.match(/rel="canonical"\s+href="([^"]+)"/)[1];
  const meta = {
    "og:type": "website",
    "og:locale": "ja_JP",
    "og:site_name": organization.name,
    "og:title": title,
    "og:description": description,
    "og:url": url,
    "og:image":
      "https://kagariholdings.com/assets/images/kagari-og-20261119.png",
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:alt":
      "篝ホールディングス株式会社 灯を継ぐ 日本の知恵・技術・心を、次の世代へ",
    "twitter:card": "summary_large_image",
    "twitter:title": title,
    "twitter:description": description,
    "twitter:image":
      "https://kagariholdings.com/assets/images/kagari-og-20261119.png",
  };
  html = html.replace(
    "</head>",
    Object.entries(meta)
      .map(
        ([key, value]) =>
          `  <meta ${key.startsWith("og:") ? "property" : "name"}="${key}" content="${escape(value)}" />`,
      )
      .join("\n") +
      `\n  <script type="application/ld+json">${JSON.stringify(organization)}</script>\n</head>`,
  );
  await fs.writeFile(file, html);
}
console.log(`Synced navigation and metadata across ${files.length} pages.`);
