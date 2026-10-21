# Final verification

Results of the checks run at the end of the audit work. **Commit:** `9680d95` (`main`, "Merge pull request #16").
**Date:** 2026-10-21. Run locally on macOS with Node 26.4 (CI uses Node 24 from `.nvmrc`), against the local DDEV
Drupal where a build was needed. Pull request #17 (breadcrumb fix) and the Dependabot pull requests were not
merged at this point and are not part of these results unless stated.

Nothing below is claimed as passing unless it was run; see "Not executed" for what was not.

> **Update, 2026-10-21 (after this report was written):** PR #17 merged and deployed (`check`, `e2e`, `build`
> and `deploy` succeeded; smoke test 200). The live site now shows the Home breadcrumb on every page, including
> "Home › Portfolio › MacDonalDesign" on project pages, and production's GraphQL returns full breadcrumb trails
> again. The production build logged no `[breadcrumbs]` warning (the only one in the run came from the E2E job's
> deliberate empty-trail simulation). The cause of the Drupal-side problem was not recorded. With PR #17, `main`
> has 81 unit tests and 50 Chromium E2E tests. The tables below describe commit `9680d95` as run.
>
> **Update, 2026-10-21 (later):** PRs #19 (favicon, WOFF2 fonts, preconnect) and #21 (Bootstrap subset) merged and
> deployed, each with all CI jobs green and the smoke test passing. `main` now has 81 unit tests and 55 Chromium E2E
> tests (the five added guard the favicon, fonts, preconnect, the Bootstrap classes and the stylesheet size
> budget). Locally, all three browsers passed 163 tests with 2 WebKit skips. The Lighthouse re-measurements are in
> [performance-review.md](performance-review.md); they show about 400 KB less per page but no change in the
> typical score.

## Passed

| Check | Command | Result |
|---|---|---|
| Formatting, lint, types, unit and component tests | `npm run check` | Exit 0. Prettier clean; ESLint 0 errors and 0 warnings; `tsc --noEmit` clean; 17 test files, **78 passed**, 1 expected failure |
| Coverage thresholds | `npm run test:coverage` | Statements 78.3%, branches 67.33%, functions 69.47%, lines 77.73% (thresholds 70/60/60/70) |
| Production dependency audit | `npm audit --omit=dev --audit-level=high` | 0 vulnerabilities |
| End-to-end, Chromium | `npx playwright test --project=chromium` | **47 passed**, 0 failed, 0 skipped (13.8 s, including the build from fixtures) |
| End-to-end, all browsers | `E2E_ALL_BROWSERS=1 npx playwright test` | **139 passed**, 0 failed, 2 skipped (the keyboard Tab tests on WebKit; Safari does not Tab to links by default) |
| Accessibility scans | included in the E2E runs (`@a11y`) | Every page and the open mobile menu match the known-violations list; the only entry is `heading-order` (Drupal content) |
| Production build against Drupal | `npm run build` (DDEV) | 12 static pages generated, **11 HTML files**, same page list as the original baseline |
| CI on `main` after the last merge (PR #16) | GitHub Actions | `check`, `e2e`, `build` and `deploy` succeeded; post-deploy smoke test returned 200 for `/`, `/about`, `/portfolio` |
| Cross-browser workflow | `gh workflow run e2e-cross-browser.yml` (run 39651545360) | Succeeded on GitHub's Linux runners (before the accessibility changes; the same suite passes locally afterwards) |
| Live site spot checks | `curl` | `/`, `/about`, `/portfolio` return 200; `/portfolio` contains 41 projects and 7 filter radios; a bad URL returns 404 with the not-found page; HTTPS enforced |
| Repository protection | `gh api` | Ruleset "Protect main" active; requires both CI checks and a pull request; secret scanning and push protection enabled |

## Failed

No check fails at this commit. Failures that occurred **during** the work and were fixed:

| When | Failure | Cause and fix |
|---|---|---|
| PR #16 CI | axe `label-content-name-mismatch` on the open mobile menu (passed locally, failed on CI) | I had set `aria-label="Menu"` on a toggle whose visible text was "mobile menu toggle". Removed the override and added a test that the accessible name matches the visible text. Not reproduced locally; the fix is based on the rule and CI then passed. |
| Local E2E | Filter test timed out | The radio inputs are visually hidden and stacked; visitors click the label pills. The test now does the same |
| Local E2E | One flaky "no network requests" test | It also counted image loads and link prefetches; it now asserts no Drupal API calls |
| Local E2E (Firefox, WebKit) | "Menu does not scroll the page" test | Smooth scrolling made it read the position mid-animation; the test now scrolls instantly and waits |
| First build of the server-component refactor | `cache: "no-store"` on fetches | Next refuses to prerender the static export with it; reverted (documented in [testing-strategy.md](testing-strategy.md)) |

## Skipped or not asserted

| Item | Why |
|---|---|
| 2 WebKit tests (Tab order, skip link focus) | Safari does not move focus to links with Tab unless a preference is set; not a site defect |
| 1 expected failure (`it.fails`) in `src/utils/html.test.ts` | Documents a known gap: `fixCmsImagePaths` rewrites only the first URL of a multi-candidate `srcset` |
| Visual regression snapshots | Deliberately not enabled (web fonts, animations, remote images would cause false positives) |

## Not executed

| Check | Why not |
|---|---|
| Screen reader testing, keyboard pass on real devices, zoom and reflow, colour contrast over images | Cannot be automated here; see the manual checklist in [testing-strategy.md](testing-strategy.md) |
| Probe of what the public production GraphQL exposes (unpublished content, introspection) | It is the live CMS; a read-only check against a local copy was offered and not requested |
| CodeQL | Not enabled in repository settings |
| Rollback procedures | Documented in [deployment.md](../deployment.md) but never exercised |
| Manual run of the deploy workflow (`workflow_dispatch`) | Not triggered; only the cross-browser workflow was dispatched |
| A real contact form submission on the live site | Would send a real message to Drupal; verified only by tests with a mocked submit and by the owner on the local site |
| Lighthouse on the project and contact pages; field (real-user) performance data | Only `/` and `/portfolio` were measured; no field data exists |
| The five Dependabot action bumps (#3 to #7) | Change the deploy path; to be merged one at a time. The five npm bumps (#8 to #12) were each installed and passed the full check and a production build locally, but are not merged |

## Issues that need manual review

1. **Drupal breadcrumb data:** fixed on the live site, cause unknown; record what changed so a recurrence can be diagnosed (details in [deployment.md](../deployment.md#known-drupal-side-issue-breadcrumbs)).
2. The footer call-to-action heading is an `<h3>` in a Drupal block (`heading-order`).
3. The alt text on portfolio card images is the project title, which is reasonable but is a decision, not a measurement.
4. The Drupal permission for the contact form's field definitions (it returned 403 locally until permissions were fixed); confirm it on production before each content rebuild.

## Remaining risks and recommendations

| Risk | Impact | Recommendation |
|---|---|---|
| Drupal breadcrumb data | Recurrence would drop intermediate crumbs (Home no longer depends on it) | Record the cause; watch the build log for `[breadcrumbs]` warnings |
| Mobile load performance (simulated LCP 7.8 to 10 s; 1.8 MB transfer, half of it fonts; a 293 KB favicon) | Slow experience on weak connections | Quick wins in [performance-review.md](performance-review.md) |
| No security headers; 10-minute cache on everything | Platform limit of GitHub Pages | Accept, or host behind a CDN/proxy |
| Public GraphQL endpoint unreviewed | Possible exposure of non-public content | Review anonymous permissions in Drupal (S4 in [security-review.md](security-review.md)) |
| No spam protection beyond a honeypot | Contact form abuse | Add Drupal-side protection (S5) |
| Actions pinned by tag; 10 Dependabot PRs open | Supply-chain and staleness | Merge deliberately, pin by SHA |
| No `prefers-reduced-motion` support | Motion for users who ask to reduce it | Small CSS change |
| Fixtures can drift from Drupal | E2E could pass while the real site changes | Re-record when content or queries change; consider GraphQL codegen |
| Content frozen at build time | Edits do not appear until a rebuild | Run the workflow after Drupal edits |

## Acceptance criteria from the brief

| Criterion | Status |
|---|---|
| ESLint, Prettier and TypeScript pass | Met |
| Dead-code findings reviewed | Met (Knip leaves 2 unused exported types in `types/WebformProps.ts`, left in place) |
| Dependencies audited | Met for production (0); 5 dev-tooling findings accepted and documented |
| Unit, component and integration tests pass | Met. There is no separate MSW layer; integration is covered by the server-component tests and E2E against the mock Drupal |
| Essential Playwright tests pass; accessibility automation runs | Met |
| No known critical functionality broken | Met as of the 2026-10-21 update (the breadcrumb defect is fixed on the live site) |
| Production build succeeds; hosting model supported | Met |
| GraphQL requests work in the intended environment | Met (deploys build against production Drupal) |
| Errors and missing data handled | Met for build and 404; the runtime `error.tsx` page is not covered by an E2E test |
| No known critical security issues | Met; open mediums are listed in the security review |
| No known high-impact accessibility blockers | Met for what automation can see; manual testing pending |
| Major performance regressions addressed | **Partly met**: baseline measured, no optimisation done yet |
| SEO metadata configured; indexing policy verified | Met for titles, canonicals and robots; this is not the primary site, so sitemap and robots are intentionally absent. There is no separate dev or preview environment to protect |
| Required checks run before deployment; failed checks block releases | Met (`needs` plus the ruleset) |
| Dev and production deploy independently | Not applicable: one environment (`main` to GitHub Pages) |
| Branch protection and approval recommendations documented | Met |
| Rollback procedures documented and, where safe, tested | Documented; **not tested** |
| Environment-specific settings protected | Met (environment secrets, `main`-only deployments) |
| README accurate; local setup reproducible; testing and deployment documented; limitations disclosed | Met by this documentation set |
