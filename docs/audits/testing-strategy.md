# Testing strategy

How the project is tested, what is and is not covered, and how to run it. Status as of **2026-10-21**.

## Layers

| Layer | Tool | What it covers | Runs |
|---|---|---|---|
| Static checks | Prettier, ESLint, `tsc` | Formatting, correctness rules, types | Pre-commit (staged files), pre-push (typecheck), CI |
| Unit | Vitest | Pure logic: metadata parsing, sitemap-to-route mapping, CMS image paths, GraphQL client errors, `getJson`, breadcrumb helper, external link labels | CI, locally |
| Component | Vitest + Testing Library | Client components (contact form, filter, off-canvas menu, image reveal, menu, breadcrumbs, social links) and server components (awaited and rendered) | CI, locally |
| End-to-end | Playwright | The real static site in a browser: navigation, forms, filtering, 404, keyboard use, metadata | CI (Chromium), weekly (all browsers), locally |
| Accessibility | axe-core via Playwright | WCAG 2.2 A/AA and best-practice rules on every page plus the open mobile menu | With E2E |

Vitest cannot render `async` Server Components (Next's own guidance), so those are tested by awaiting the
component function and rendering the returned element, and end to end through Playwright.

## How E2E gets its data

CI and local runs never contact a live Drupal. `e2e/mock-drupal.mjs` serves **recorded responses**
(`e2e/fixtures`, 21 files) and answers media requests with a placeholder image. `e2e/server.mjs` builds the
site against that mock into `.next-e2e` and serves it the way GitHub Pages does (clean URLs, a real 404 status).

Re-record the fixtures when Drupal content or the GraphQL queries change:

```bash
npm run e2e:record -- https://portfolio.ddev.site:33001   # use the URL from `ddev describe`
```

The recorder rewrites the origin to a placeholder, normalises the DDEV port quirk on relative URLs, never
records form submissions, and writes pretty-printed JSON so diffs are reviewable. Fixtures contain the
site's public content, including the contact details shown in the footer.

The mock can also simulate a misbehaving Drupal: `E2E_EMPTY_BREADCRUMBS="/about"` (set in
`playwright.config.ts`) makes it return an empty breadcrumb trail for the listed pages.

Each run uses a fresh mock port. Next keeps a build-time fetch cache in `.next/cache` keyed by URL, so a new
origin guarantees fixture changes are seen. (`cache: "no-store"` is not an option; the static export refuses to
prerender with it.)

## Commands

| Command | Purpose |
|---|---|
| `npm test` | Unit and component tests |
| `npm run test:coverage` | Same, with coverage and thresholds |
| `npm run test:e2e` | E2E on Chromium (builds from fixtures, serves, runs, shuts down; about 12 s) |
| `E2E_ALL_BROWSERS=1 npm run test:e2e` | Also Firefox and WebKit (`npx playwright install` first) |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:a11y` | Only the axe scans (`@a11y`) |
| `npm run check` | Format check, lint, typecheck, unit tests (what CI's first job runs) |

## Coverage

Thresholds (CI fails below): statements 70, lines 70, branches 60, functions 60. They were set a few points
below the baseline when added. At the last measurement: about 78% statements, 67% branches, 69% functions.
Coverage covers `lib/`, `src/` and `components/`; pages are covered by E2E instead. The goal is meaningful
coverage of logic and user-visible behaviour, not a percentage.

## The accessibility ratchet

`e2e/a11y.spec.ts` lists the axe violations that exist today per page. **The list is currently empty**: every page and
the open mobile menu scan clean (the last entry, `heading-order` from a footer heading in a Drupal block, was fixed on
2026-10-22). The test fails when a **new** violation appears and also when a listed one is **fixed**, so if one ever
has to be accepted it is added with its reason and removed as soon as it is resolved.

## Test quality checks done

Key tests were checked by temporarily breaking the code they guard and confirming they fail: the label fix, the
double-submit guard, stale-request handling (since removed with the server-component rewrite), the menu's
`inert` and `preventDefault`, and the Home breadcrumb. One E2E test (the menu toggle not scrolling the page)
does **not** discriminate for its change, because Next's `<Link>` already cancels the `#` jump; it stays as a
regression guard.

## Gaps

| Gap | Notes |
|---|---|
| Colour contrast over background images | axe reports these as "incomplete"; check by hand |
| Zoom, reflow, touch target size, reduced motion | Not automated |
| Screen reader behaviour | Not tested; see the manual checklist |
| Visual regression | Deliberately not enabled: web fonts, animations and remote images would cause constant false positives |
| Real Drupal contract | Fixtures can drift from Drupal. Re-record periodically; GraphQL Code Generator would add a schema check |
| Contact form against real Drupal | The submit is mocked; a real submission has been confirmed manually only |
| Production-only behaviour (CDN, cache headers) | Covered only by the post-deploy smoke test (three URLs return 200) |

## Manual test checklist (before a release that changes UI)

1. **Keyboard only:** Tab through the home, portfolio and contact pages. The skip link appears first; focus is always visible; the mobile menu opens with Enter or Space, traps nothing, closes with Escape and returns focus to the toggle.
2. **Screen reader** (VoiceOver on macOS, NVDA on Windows): landmarks (banner, main, contentinfo), heading outline, the two social links announce "LinkedIn/GitHub (opens in a new tab)", form fields announce their labels and required state, success and error messages are announced.
3. **Zoom and reflow:** 200% and 400% browser zoom; no horizontal scrolling at 320 CSS px; the header does not cover content.
4. **Contrast:** check text over the hero and section background images, and link colours, against 4.5:1 (3:1 for large text).
5. **Reduced motion:** with "reduce motion" on, check the image reveal and the menu slide.
6. **Touch targets:** the mobile menu toggle, filter pills and form controls are at least 24 by 24 CSS px (WCAG 2.2).
