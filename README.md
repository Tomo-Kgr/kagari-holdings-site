# Kagari Holdings Site

Static corporate website for Kagari Holdings Co., Ltd.

## Structure

- `index.html`: semantic HTML, SEO metadata, OGP, Twitter Card, JSON-LD
- `assets/css/styles.css`: responsive layout and visual system
- `assets/js/main.js`: navigation state and restrained scroll reveal
- `assets/css/fonts.css`, `assets/fonts/`: self-hosted fonts and their SIL Open Font Licenses
- `assets/images/`: optimized photographs and the supplied calligraphic brand mark
- `team/index.html`: representative profile and finance operations
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

Edit page copy in each directory's `index.html`. The shared visual tokens, typography, layout and responsive components live in `assets/css/styles.css`; menu and motion behavior live in `assets/js/main.js`. The header and footer are static HTML on every page so navigation remains available without JavaScript. Keep their links consistent when adding a page.

Fonts are hosted locally and subset to the characters used across all HTML pages. After changing copy, run `node scripts/update-fonts.mjs --check`; if new characters are missing, run `node scripts/update-fonts.mjs` (Node 18+ and internet access required). Commit the generated CSS, fonts, coverage file and preload links together. Native Mincho fonts remain a fallback. Retain the SIL licenses in `assets/fonts/`.

Add `--include-drafts` when generating or checking fonts for the local recruitment draft.

Do not reintroduce externally hosted fonts or analytics without reviewing the privacy policy. Update the CSS/JS query version in every HTML file when releasing asset changes, and update the sitemap dates for materially changed pages.

The contact pages open the visitor's email application; they do not submit a form or store leads on this website. The privacy policy should be reviewed when operational practices, processors, recruitment processes or tracking services change.

## Image Provenance

- `factory-*.webp`: responsive, compressed derivatives of the existing generated factory image (`kagari-hero.png`).
- `kagari-mark.png`: the original calligraphic mark from the company-supplied presentation cover. The optimized `kagari-mark-192.png` is used as an alpha mask to match light and dark headers; the original also supplies `favicon.png`.
- `eiji-nagakura.webp`: the representative's real photograph extracted from the company-supplied presentation, resized and compressed.
- `kagaribi-*.webp`: an AI-generated, fictional shrine scene, created with the built-in ImageGen tool. It does not depict a company-owned site, investment or affiliated shrine.

Generation direction for the kagari-bi image: photorealistic, wide 16:9 editorial photograph of a fictional modest Shinto courtyard at blue hour; a traditional weathered iron fire basket on the right third, natural small gold flames and glowing wood; cedar trees, shrine eaves and stone visible; quiet darker space on the left for copy. Dignified documentary character, subtle grain. No people, text, logos, watermark, dramatic sparks, heavy smoke, bokeh or oversaturated orange.

## Release Checks

- Test all 18 public routes and the local recruitment draft at desktop and mobile sizes, including 320px width.
- Check keyboard navigation, Escape-to-close, visible focus, text resizing, reduced motion and JavaScript-disabled navigation.
- Run automated WCAG A/AA checks and visually check text over images.
- Verify internal links, image loading and absence of unpublished member identities.
- Verify the live pages, `robots.txt` and sitemap after deployment.
