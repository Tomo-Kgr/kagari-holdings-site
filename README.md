# Kagari Holdings Site

Static corporate website, hosted on Vercel. Production deploys from `main`.

## November 19 Revision

The approved revision has seven primary pages: home, philosophy, principal investment (`/business/`), consulting, investment policy, representative message (`/team/`), and contact. Existing news, electronic notices and privacy policy remain available.

- Contact is consolidated at `/contact/`, with anchors for owners, consulting, advisors and general inquiries. The four former contact subpages return HTTP 301.
- `/process/` and `/value-up/` return HTTP 301 to `/business/`.
- The vision wording, registration-linked company facts, representative message and biography, and investment funding row remain unchanged pending separate confirmation.
- `data-preserved` identifies the representative passages intentionally exempted from the new terminology rules. Do not change those passages without approval.
- Photo provenance is kept in the company's internal material register, not the public website or deployment. Font licenses remain with the self-hosted fonts.
- The revised reference uses a single shrine/fire hero, not the previous carousel. On narrow screens the focal position is adjusted to keep the large fire basket in view.

## Development

Page copy lives in each route's `index.html`. Shared tokens, navigation and legacy page styles are in `assets/css/styles.css`; the revision's sections are in `assets/css/editorial.css`. `assets/js/main.js` handles the responsive menu and local font loading. The calligraphic brand mark and representative portrait remain the existing supplied assets.

Edit the home page's header/footer, then run:

```text
node scripts/sync-layout.mjs
node scripts/update-fonts.mjs --check
node scripts/check-site.mjs
node scripts/build.mjs
node scripts/preview.mjs --dist
```

The preview server prints an available loopback URL and models the configured redirects. Stop it after review. `scripts/build.mjs` only publishes explicitly allowed routes and asset types; source documents, material registers, review reports, environment files and drafts are never copied.

After adding characters, regenerate local font subsets with `node scripts/update-fonts.mjs`. The site uses Noto Serif JP 400-600, Cinzel 600 and Cormorant Garamond. Keep the generated font files, CSS and coverage record together. Fonts are not requested from an external service by visitors.

## Review and Publication

Keep revisions needing approval on a separate `codex/` branch. Push that branch for a Vercel Preview deployment; **do not push to `main` until the user approves publication**. Vercel Preview builds receive `noindex, nofollow` metadata and a disallow-all robots file. Canonical URLs continue to point to the production domain.

The optional local-only `node scripts/build.mjs --preview` mode includes the recruitment draft from `.drafts/`. Never upload that output. The public recruitment placeholder stays noindex and unlinked.

The contact page opens the visitor's email application and does not submit a web form, store leads or send automated responses. Keep the working `mailto:` address unless a real, tested submission service is connected. Never put credentials in browser code, source control or preview reports.

## Checks

- `check-site.mjs`: public routes, internal references, retired terminology (with explicit preserved-copy exceptions), redirects, sitemap and metadata assets.
- `update-fonts.mjs --check`: font character coverage.
- Test desktop/tablet/mobile layouts, including 320px and 375px; verify the fire basket framing, business/contact grids, photo strip and Fuji background.
- Test keyboard navigation, Escape, focus states, JavaScript-disabled navigation, image loading and accessibility contrast.
- Compare preserved passages and company details against the previous approved version. Keep news, electronic notice content and privacy policy body unchanged.
- Verify the hosted preview's pages, redirects and noindex behavior before sending its URL for approval. Production must remain unchanged during preview.
