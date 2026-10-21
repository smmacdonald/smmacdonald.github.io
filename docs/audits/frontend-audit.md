# Frontend audit

Initial audit of the portfolio frontend, with the outcome of each finding as of **2026-10-21**.
The audit was read-only first; everything below marked "Done" was implemented afterwards in
reviewed pull requests (see [implementation-plan.md](implementation-plan.md)).

## What this project is

A Next.js static export that renders content from a Drupal 11 headless CMS. It is a showcase
project featured on the portfolio at `macdonaldesign.com` (the Drupal site), not the primary
site. It deploys from `main` to GitHub Pages at `https://smmacdonald.github.io/`.

| | At the start of the audit | Now |
|---|---|---|
| Next.js / React / TypeScript | 16.2.12 / 19.2.4 / 5.9 (strict) | 16.4.2 / 19.2.4 / 5.9 (strict) |
| Package manager / Node | npm / unpinned (CI used 20) | npm / 24 (`.nvmrc`, `engines`) |
| Rendering | `output: 'export'`, Drupal data fetched at build **and** in the browser | `output: 'export'`, all Drupal content fetched at build time; only form submission is a browser request |
| Deployment | GitHub Actions to GitHub Pages on push to `main`, no checks | Same trigger, gated by format/lint/typecheck/unit/E2E/audit; post-deploy smoke test |
| Tests | none | 78 unit/component tests and 47 Playwright tests on `main` (81 and 50 with the open breadcrumb PR #17); weekly cross-browser run |

The audit brief assumed a Bluehost deployment with `develop` and `prod` branches. Those belong to the
Drupal site, not this repository; this repository only ever deployed to GitHub Pages from `main`.

## Executive summary

**Condition at the start:** a small, readable codebase with strict TypeScript, current framework versions and a
sensible Server-Component-first layout. It had no tests, no formatter, no quality gates in CI, a vulnerable
Next.js version, no error handling around Drupal requests, content fetched in the browser that could have been
static, and several accessibility gaps.

**Strengths:** strict TypeScript from the start, a thin and clear data layer (`lib/`, `graphql/`), a lockfile,
a deploy workflow that already validated its environment variables and scoped its permissions, and a
build-time static export (no server to run or secure).

**Weaknesses:** correctness safety nets (none), accessibility, dependency hygiene, and silent failure modes
(a Drupal outage or misconfiguration could ship a broken site).

**Biggest wins delivered:** security upgrade, loud build failures, quality gates and tests that block deploys,
server-rendered content, and an accessibility pass that took axe from 6 distinct violated rules across the site to 1 (`heading-order`, a Drupal content edit).

**Biggest remaining opportunities:** mobile load performance (LCP 7.8 to 9.3 s on simulated mobile; see
[performance-review.md](performance-review.md)), a Drupal-side breadcrumb problem that breaks the live
breadcrumbs, and manual accessibility checks that automation cannot do.

## Findings

Status: **Done** (merged), **Open PR** (written and verified, awaiting merge), **Open** (not started),
**Drupal** (the fix is in the CMS, not this repository), **Won't fix** (deliberately not changed).

| Priority | Category | Finding | Evidence | Recommendation | Effort | Status |
|---|---|---|---|---|---|---|
| Critical | Security | Installed `next` 16.2.12 was in a vulnerable range; `npm audit --omit=dev` reported 1 critical and 3 high | `npm audit` at start | Upgrade within 16.x | Low | Done: 16.4.2, 0 production vulnerabilities |
| High | Reliability | Data layer ignored HTTP status and GraphQL `errors`; layout and pages read `data.*` unguarded | `lib/graphql.ts`, `app/layout.tsx` at start | Throw on non-2xx and GraphQL errors, add a timeout | Low | Done |
| High | Reliability | Missing routes rendered `null` with a 200; home page assumed content existed | `app/[...slug]/page.tsx` at start | `notFound()`, `not-found.tsx`, `error.tsx` | Low | Done |
| High | Build | `generateStaticParams` swallowed fetch errors (build failed later with a misleading message, not silently) | `app/[...slug]/page.tsx` at start | Throw with the real cause, refuse an empty sitemap | Low | Done. *Correction: the original wording of this finding overstated it as "ships an empty site".* |
| High | Architecture | Featured/previous work and the contact form definition were fetched in the browser; API origin baked into the bundle | `PreviousWork.tsx`, `WebformContact.tsx` at start | Fetch on the server at build time; keep only the filter and submit in the browser | Medium | Done (content is now frozen at build time; refresh by running the workflow manually) |
| High | CI/CD | Deploy ran with no lint, typecheck, test or audit; Node 20 vs local 26; actions pinned by tag | `.github/workflows/deploy.yml` at start | `check` and `e2e` jobs gate `build`; `.nvmrc`; PR trigger | Medium | Done (actions still pinned by tag; Dependabot PRs for newer majors are open) |
| High | Accessibility | No `<main>`, no skip link, mobile menu not keyboard or screen-reader accessible, form labels pointed at the wrong ids, icon-only links without names | See [testing-strategy.md](testing-strategy.md) for the axe results | Fix each; track with the axe ratchet | Medium | Done, except the footer heading (Drupal) |
| High | Security | Contact form showed Drupal's raw response to the visitor on failure | `WebformContact.tsx` at start | Generic message, log detail to the console | Low | Done |
| Medium | Security | Several components inject Drupal HTML with `dangerouslySetInnerHTML` | `Basic.tsx`, `FeaturedColumn.tsx`, `Text.tsx`, `FooterBrandAndSocial.tsx`, `BlockReference.tsx` | Content is authored by you; centralise in one `RichText` component if sanitisation is ever needed | Low | Open (accepted risk, see [security-review.md](security-review.md)) |
| Medium | Security | No security headers or CSP | Live response headers | Not settable on GitHub Pages; needs a different host or a proxy | n/a | Won't fix (platform limit) |
| Medium | SEO | Project pages requested no metatags; 404 page had no title; home canonical pointed at the redirecting `/homepage` | Built HTML, axe `document-title` | Request `metatagFields`, title the 404 page, rewrite the home canonical | Low | Done |
| Medium | SEO | `robots.txt`, sitemap, JSON-LD missing | Live site | `macdonaldesign.com` is the primary site and has its own; adding them here would compete with it | n/a | Won't fix (by design) |
| Medium | Types | GraphQL responses are untyped (`any`); `types/` are hand-written | `lib/graphql.ts` | GraphQL Code Generator with a committed schema | Medium | Open (needs introspection access; see roadmap) |
| Medium | Lint | 451 lint problems, almost all from vendored `assets/` | `npx eslint .` at start | Ignore vendored assets; fix the 8 real findings | Low | Done |
| Medium | Performance | Fonts are TTF (Montserrat 672 KB / Playfair 295 KB on disk), a 293 KB PNG named `favicon.ico`, one 406 KB stylesheet (whole Bootstrap), no `preconnect` to the Drupal image host | Built output, Lighthouse | See [performance-review.md](performance-review.md) | Low to Medium | Open |
| Medium | Repo | Compiled CSS, starter `public/*.svg` and an unused `html-react-parser` dependency were committed or installed | `git ls-files`, Knip | Remove after verifying | Low | Partly done (`html-react-parser` removed; the full FontAwesome copy is **kept on purpose** so editors can use any icon) |
| Medium | Correctness | `PreviousWork` filter had a stale-response risk and a `setState`-in-effect lint error | `PreviousWork.tsx` at start | Resolved by the server-component rewrite (no requests to race) | Medium | Done |
| Low | Quality | Unused GraphQL files and invalid fragments (targeting types missing from the schema) | Knip; schema introspection | Delete dead ones, fix and use the shared ones | Low | Done |
| Low | Config | No `.env.example`; `basePath` hard-coded for production | `next.config.ts` at start | `.env.example`, `BASE_PATH` env var | Low | Done |
| Medium | Accessibility | No `prefers-reduced-motion` handling for the image reveal, the menu slide-in or the smooth scrolling | `grep prefers-reduced-motion assets/ app/ components/` finds nothing | Add a `@media (prefers-reduced-motion: reduce)` block that disables the transitions and animations | Low | Open |
| Low | Quality | Footer call to action is an `<h3>` right after the `<h1>` (axe `heading-order`) | CMS block body | Change it to `<h2 class="h3">` in Drupal | Low | Drupal |
| Low | Accessibility | External links open a new tab without `rel` | `SocialMediaElement.tsx` | `rel="noopener noreferrer"` | Low | Done |

## Architecture recommendations

| Area | Recommendation | Status |
|---|---|---|
| Component organisation | Server Components by default; small client "islands" (`StickyHeader`, `OffCanvasPanel`, `ImageReveal`, `PreviousWorkFilter`, `ContactFormShell`) that receive server-rendered `children` | Done |
| Data fetching | One typed-ish fetch helper per kind (`fetchGraphQL`, `getJson`) with timeouts and loud failures | Done |
| GraphQL | Shared fragments (`breadcrumbs`, `metatag`, `socialMediaItem`, `paragraphSocialMedia`); remove duplicates | Done. Codegen still open |
| Rendering | Fully static; all content at build time | Done |
| Error handling | `not-found.tsx`, `error.tsx`, thrown build errors | Done |
| Maintainability | Prettier, ESLint, Knip, Husky, Dependabot | Done |
| Deployment | Gated pipeline, branch ruleset, smoke test, documented rollback | Done (rollback is documented but untested; see [deployment.md](../deployment.md)) |

## Recommended tooling

| Tool | Purpose | Existed before? | Benefit | Config complexity | Maintenance | Priority | Blocks CI? | Status |
|---|---|---|---|---|---|---|---|---|
| Prettier + `eslint-config-prettier` | Consistent formatting | No | No style debate, small diffs | Low | Low | High | Yes (`format:check`) | Done |
| `typecheck` script | Standalone `tsc --noEmit` | No | Fast type gate | Low | None | High | Yes | Done |
| Vitest + Testing Library | Unit and component tests | No | Regression safety | Low | Low | High | Yes | Done |
| Playwright + axe-core | E2E and accessibility | No | Verifies real behaviour in browsers | Medium | Medium (fixtures) | High | Yes (Chromium) | Done |
| Husky + lint-staged | Pre-commit format/lint, pre-push typecheck | No | Catches problems early | Low | Low | Medium | No | Done |
| Knip | Dead code and unused dependencies | No | Found 9 dead files and 1 unused dependency | Low | Low | Medium | No (run manually) | Done |
| Dependabot | Dependency and action updates | No | Fewer stale dependencies | Low | Medium (PR review) | Medium | No | Done (10 PRs open) |
| GitHub ruleset | Protect `main` | No | Failed checks cannot be merged | Low | None | High | n/a | Done |
| CodeQL | Static security analysis | No | Finds common vulnerabilities | Low | Low | Medium | Advisory | Open |
| GraphQL Code Generator | Generated types from a saved schema | No | Types cannot drift from Drupal | Medium | Low | Medium | Yes (drift check) | Open |
| Lighthouse CI | Performance budgets | No | Catches regressions | Medium | Medium | Low | No | Open (baseline taken manually) |
| Zod | Runtime validation of REST responses | No | Safer boundaries | Medium | Low | Low | No | Not recommended: build-time failures already surface bad data |

## Deployment risk assessment

| Risk | Assessment | Mitigation |
|---|---|---|
| Hosting model | Static export on GitHub Pages: no server runtime, so no Node-version or SSR compatibility risk | None needed |
| Drupal availability at build | The build needs a reachable Drupal; the deployed site does not (except contact form submit) | Build fails loudly; the previous deploy stays live |
| Drupal data quality | A bad Drupal response is published as-is (this caused the missing breadcrumbs) | Home breadcrumb no longer depends on Drupal; a build warning flags empty trails |
| Environment configuration | API URLs are environment secrets restricted to `main` | Documented in [deployment.md](../deployment.md) |
| Workflows | Read-only default permissions; per-job `contents: read`; concurrency prevents overlapping deploys | Ruleset requires both CI checks |
| Branch promotion | Single branch (`main`); PR required by the ruleset | Admin bypass exists for emergencies |
| Rollback | GitHub Pages has no rollback button | Revert and redeploy, or re-run an earlier workflow run (untested) |
| Third-party actions | Pinned by tag, not commit SHA | Dependabot PRs open for newer majors; pin by SHA when merging them |

## Roadmap

See [implementation-plan.md](implementation-plan.md).
