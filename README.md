# Kagari Holdings Site

Static corporate website for Kagari Holdings Co., Ltd.

## Structure

- `index.html`: semantic HTML, SEO metadata, OGP, Twitter Card, JSON-LD
- `assets/css/styles.css`: responsive layout and visual system
- `assets/css/editorial.css`: current editorial components, typography and page rhythm
- `assets/js/main.js`: navigation state and restrained scroll reveal
- `assets/css/fonts.css`, `assets/fonts/`: self-hosted fonts and their SIL Open Font Licenses
- `assets/images/`: optimized photographs and the supplied calligraphic brand mark
- `team/index.html`: representative profile and finance operations
- `philosophy/index.html`: mission, vision and the five corporate principles approved in the November 13 MVV; the home page summarizes these principles. Internal behavioral guidelines are not public.
- `investment-policy/index.html`: approved investment criteria; the old `investment-themes` URL permanently redirects here
- `news/index.html`: dated, factual company announcements
- `consulting/index.html`, `contact/consulting/index.html`: consulting services and email contact
- `koukoku/index.html`: guide to the external electronic notice page at freee; retain the registered external URL
- `privacy-policy/index.html`: privacy policy and contact information
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, `favicon.png`: publishing assets

## Deploy

The output is a static site. Run `node scripts/build.mjs` to produce `dist/`; Vercel runs this command automatically. The release build stops if any public page contains an unresolved confirmation marker. Publish only `dist/` when using another host.

Vercel deploys the `main` branch. Keep new work on a separate branch when a preview is needed before publication. The HTML uses root-relative paths, so GitHub Pages requires the existing custom domain (or path adjustments for a repository subpath).

Do not push unconfirmed material to the public repository or a remotely hosted preview. `node scripts/build.mjs --preview` creates a local-only review in `.review/site/`, including the recruitment draft at `/draft-recruit/`. Recruitment drafts in `.drafts/` and all `.review/` files are ignored by Git and excluded from production builds. The existing `/recruit/` placeholder remains `noindex` and unlinked until recruitment details are approved.

Run `node scripts/preview.mjs` after the review build to serve it on this PC only. The server prints a loopback URL and tries another port if its default port is occupied. Stop it with Ctrl+C when finished.

## Editing

Edit page copy in each directory's `index.html`. Base tokens and legacy components live in `assets/css/styles.css`; the current editorial layout and components live in `assets/css/editorial.css`. Menu and motion behavior live in `assets/js/main.js`. The header and footer are static HTML so navigation works without JavaScript. Edit shared navigation in the home page, then run `node scripts/sync-layout.mjs` to copy it and the shared SEO metadata across pages. Update the release version in that script when shipping new styles or JavaScript. Add new routes to `scripts/build.mjs` and the sitemap.

Fonts are hosted locally and subset to the characters used across all HTML pages. After changing copy, run `node scripts/update-fonts.mjs --check`; if new characters are missing, run `node scripts/update-fonts.mjs` (Node 18+ and internet access required). Commit the generated CSS, fonts, coverage file and preload links together. Native Mincho fonts remain a fallback. Retain the SIL licenses in `assets/fonts/`.

Add `--include-drafts` when generating or checking fonts for the local recruitment draft.

Do not reintroduce externally hosted fonts or analytics without reviewing the privacy policy. Update the CSS/JS query version in every HTML file when releasing asset changes, and update the sitemap dates for materially changed pages.

The contact pages open the visitor's email application; they do not submit a form or store leads on this website. Microsoft 365 was selected for a future form connection, but no web submission endpoint or automatic reply has been configured. Do not replace the working email links with a nonfunctional form. A connection must be scoped to the intended mailbox, include spam protection, and pass submission/receipt/reply tests before release. Never place credentials in HTML, JavaScript served to visitors, or Git. The privacy policy should be reviewed when operational practices, processors, recruitment processes or tracking services change.

## Image Provenance

- `narai-*.webp`: real Narai-juku street photograph by Joris Beugels, used under the Unsplash License. See `assets/images/credits.txt`. The location is not presented as a Kagari property or portfolio company.
- `kagari-og-20261108.png`: social sharing image using the supplied logo and site typography.
- `factory-*.webp`: legacy generated image, no longer displayed on current pages.
- `kagari-mark.png`: the original calligraphic mark from the company-supplied presentation cover. The optimized `kagari-mark-192.png` is used as an alpha mask to match light and dark headers; the original also supplies `favicon.png`.
- `eiji-nagakura.webp`: the representative's real photograph extracted from the company-supplied presentation, resized and compressed.
- `hero-*.webp`: real metalworking, agriculture and fishery photographs in the home hero and philosophy Mission background, alongside Narai-juku. The next image is decoded before transition; playback pauses on hover, keyboard interaction and when offscreen. Reduced-motion and data-saver preferences start paused. Photographer/source/license details are in `assets/images/credits.txt`; these are illustrative industry photographs, not Kagari portfolio companies.
- `industry-*.webp`: responsive agriculture, metalworking and water-treatment images accompanying sector explanations. Edit the `industry-features` region on the home page and run `sync-layout.mjs` to update the existing investment-policy page; no separate sector routes are used.
- `icon-play.svg`, `icon-pause.svg`: Lucide icons; ISC license retained in `assets/images/lucide-LICENSE.txt`.
- `kagaribi-*.webp`: legacy generated shrine scene, no longer displayed on current pages.

Generation direction for the kagari-bi image: photorealistic, wide 16:9 editorial photograph of a fictional modest Shinto courtyard at blue hour; a traditional weathered iron fire basket on the right third, natural small gold flames and glowing wood; cedar trees, shrine eaves and stone visible; quiet darker space on the left for copy. Dignified documentary character, subtle grain. No people, text, logos, watermark, dramatic sparks, heavy smoke, bokeh or oversaturated orange.

## Release Checks

- Test all 19 content routes and the investment URL redirect at desktop, tablet and mobile sizes, including 320px width.
- Run `node scripts/check-site.mjs` and `node scripts/update-fonts.mjs --check` before the release build.
- Check keyboard navigation, Escape-to-close, visible focus, text resizing, reduced motion and JavaScript-disabled navigation.
- Run automated WCAG A/AA checks and visually check text over images.
- Verify internal links, image loading and absence of unpublished member identities.
- Verify the live pages, `robots.txt` and sitemap after deployment.
