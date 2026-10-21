# End-to-end tests

Playwright tests run against the real static site, built from **recorded Drupal
responses** (`e2e/fixtures`). Nothing here needs a live Drupal or any secret.

## Running

```bash
npm run test:e2e        # Chromium; builds the site from fixtures, serves it, runs the tests
npm run test:e2e:ui     # Playwright UI mode
npm run test:a11y       # only the axe accessibility scans (@a11y)
E2E_ALL_BROWSERS=1 npm run test:e2e   # also Firefox and WebKit (installed with: npx playwright install)
```

First time on a machine: `npx playwright install chromium`.

`e2e/server.mjs` starts a mock Drupal (`e2e/mock-drupal.mjs`) on a free port,
builds the site into `.next-e2e` (separate from `.next`, so a running `next dev`
is not disturbed), then serves it on `http://127.0.0.1:4011` the way GitHub Pages
does (clean URLs, `404.html` with a 404 status).

## Re-recording fixtures

Do this when the Drupal content or the GraphQL queries change, with the
backend running (for DDEV, use the URL from `ddev describe`):

```bash
npm run e2e:record -- https://portfolio.ddev.site:33001
```

The mock proxies the build's requests to that Drupal and saves each response.
Then review the diff in `e2e/fixtures` before committing. Fixtures contain the
site's public content, including the contact details shown in the footer. Form
submissions are never sent to Drupal or recorded.

Media files are served as a neutral placeholder image.

## Known gaps

Tests marked `test.fixme` document problems found in the audit (for example the
missing skip link and project-page metadata). `e2e/a11y.spec.ts` lists the
axe violations that exist today; it fails when a new one appears **and** when a
listed one is fixed, so delete entries as the issues are resolved.

Automated checks do not replace manual testing: color contrast over images,
keyboard use, zoom/reflow and screen reader behavior still need a hand check.
