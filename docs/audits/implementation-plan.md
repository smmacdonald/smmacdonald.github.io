# Implementation plan

What was planned, what shipped, and what is left. Status as of **2026-10-21**.
Findings and rationale are in [frontend-audit.md](frontend-audit.md).

## How the work was delivered

Each phase was built on a branch, verified locally, and merged through a pull request that had to pass the
CI checks. The live site was checked after every merge. Phase 1 predates the branch ruleset and was merged
to `main` directly by the repository owner after local verification.

| Phase | Scope | Delivered in | Status |
|---|---|---|---|
| 1. Correctness and critical issues | Next.js security upgrade; loud Drupal failures; `not-found`/`error` pages; `BASE_PATH`; `.env.example`; form label fix | `main` (4 commits) | Done |
| 1b. CI safety net | `check` job (typecheck, audit), export verification, post-deploy smoke test, `.nvmrc`, PR trigger | PR #1 | Done |
| 2. Quality tooling | ESLint ignores and fixes; Prettier; Husky and lint-staged; Knip; Dependabot; shared GraphQL fragments; dead code removal | PR #2 | Done |
| 3a. Unit and component tests | Vitest, Testing Library, coverage thresholds, CI step | PR #13 | Done |
| 3b. Server components | Content fetched at build time; small client islands | PR #14 | Done |
| 3c. End-to-end tests | Playwright, mock Drupal with recorded fixtures, axe scans, CI job, weekly cross-browser run | PR #15 | Done |
| 4a. Accessibility and metadata | `<main>`, skip link, named links, accessible mobile menu, page titles, canonical, generic form error | PR #16 | Done |
| 4b. Breadcrumb resilience | Always render the Home breadcrumb when Drupal returns an empty trail | PR #17 | Done; live site verified |
| 4c. Performance quick wins | Small favicon, WOFF2 fonts, preconnect to the Drupal image host | PR #19 | Done; -390 KB per page measured |
| 4d. Bootstrap subset | Import only the Bootstrap modules in use; guards for the classes and a stylesheet size budget | PR #21 | Done; -93 KB raw / -12 KB gzip CSS; no pixel differences; Lighthouse median unchanged |
| 6. Documentation | These documents and the README | PR #18 | Done |

Phase 5 (CI/CD hardening) was delivered incrementally inside phases 1b to 3c rather than as a separate step.

## Remaining work, in priority order

| # | Item | Why | Effort | Depends on |
|---|---|---|---|---|
| 1 | Record what fixed the Drupal breadcrumb data (production returns full trails again as of 2026-10-21) so a recurrence can be diagnosed; see [deployment.md](../deployment.md#known-drupal-side-issue-breadcrumbs) | The cause is unknown; the Home link no longer depends on it, but intermediate crumbs still do | Low | Drupal access |
| 2 | ~~Change the footer call-to-action `<h3>` to `<h2 class="h3">` in Drupal~~ **Done (2026-10-22):** changed in Drupal, fixture re-recorded, `heading-order` entry removed; all axe scans are clean | Last automated accessibility violation | Low | Drupal access |
| 3 | ~~Performance quick wins~~ **Done (PR #19):** favicon 293 KB to 4.5 KB, WOFF2 fonts, preconnect. Measured -390 KB per page; Lighthouse scores unchanged (see [performance-review.md](performance-review.md)). Next: the 406 KB render-blocking stylesheet (item 8) | Mobile LCP is still about 7.4 to 8 s (simulated) | Low | none |
| 4 | Review and merge the Dependabot PRs (#3 to #12); pin actions by SHA when doing so | Keeps the toolchain current. The five npm updates already build and pass locally; the five action bumps change the deploy path and should go one at a time | Low | none |
| 5 | Enable CodeQL and Dependabot security updates in repository settings | Free static analysis and automatic security PRs | Low | repository settings |
| 6 | Add `prefers-reduced-motion` support (disable the image reveal, menu slide-in and smooth scroll when requested) | Found in the original audit and never fixed | Low | none |
| 7 | Manual accessibility pass (contrast over images, zoom/reflow, screen reader) | Automation cannot decide these | Medium | none |
| 8 | ~~Smaller CSS~~ **Done (PR #21, Bootstrap subset).** Remaining: responsive Drupal image styles | Performance | Medium | Drupal image styles |
| 9 | GraphQL Code Generator with a committed schema | Types that cannot drift from Drupal | Medium | Confirm Drupal allows introspection |
| 10 | Test the rollback procedure once | The procedure is documented but never exercised | Low | none |

## Explicit non-goals

- `robots.txt`, sitemap, JSON-LD: `macdonaldesign.com` is the primary site and already provides them.
- Security headers and a Content Security Policy: GitHub Pages cannot set response headers.
- Replacing the full FontAwesome copy: kept deliberately so editors can use any icon.
- Zod and Lighthouse CI: no identified problem they would solve today.
