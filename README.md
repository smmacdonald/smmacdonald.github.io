# Personal Portfolio — Next.js + Drupal 11

A modern personal portfolio built with **Next.js** and powered by **Drupal 11**. The project uses Drupal as a headless content management system and Next.js as the frontend presentation layer, bringing together content from my personal portfolio and presenting it as a fast, responsive website hosted on **GitHub Pages**.

## Overview

This project demonstrates how a modern Next.js application can consume content from a Drupal 11 backend through both **GraphQL** and the **REST API**.

Drupal manages the portfolio content and structured data, while Next.js is responsible for retrieving, transforming, and displaying that information in the frontend.

The result is a decoupled architecture that combines Drupal's powerful content management capabilities with Next.js's modern React-based frontend and static site generation.

### Architecture

```text
                    Drupal 11
                 Headless CMS
                      │
              ┌───────┴────────┐
              │                │
          GraphQL           REST API
              │                │
              └───────┬────────┘
                      │
                      ▼
                  Next.js
               React Frontend
                      │
             Static Generation
                      │
                      ▼
                GitHub Pages
```

## What This Project Does

The application pulls information from my personal portfolio stored in Drupal and uses that content to build the website.

Depending on the content type, Next.js can retrieve information such as:

* Personal and professional information
* About/profile content
* Projects and case studies
* Skills and technologies
* Work experience
* Contact information
* Other structured portfolio content managed through Drupal

Rather than hard-coding this information into the Next.js application, Drupal acts as the source of truth. This makes the frontend easier to maintain while allowing content to be managed independently from the presentation layer.

## Technologies

* **Next.js** — React framework and frontend application
* **React** — UI development
* **Drupal 11** — Headless CMS and content management
* **GraphQL** — Structured content queries
* **REST API** — API access for Drupal resources and content
* **GitHub Pages** — Static hosting
* **GitHub Actions** — Automated builds and deployment
* **Sass and Bootstrap 5** — Layout and styling; only the Bootstrap modules the site uses are imported
* **FontAwesome (full library)** — Icons, so editors can use any icon anywhere
* **TypeScript, ESLint, Prettier** — Type safety and consistent code
* **Vitest and Testing Library** — Unit and component tests
* **Playwright and axe-core** — End-to-end and accessibility tests, run against recorded Drupal fixtures

## Drupal 11 Integration

Drupal 11 serves as the backend for the portfolio.

Content is modeled in Drupal and exposed through APIs that the Next.js application consumes. This creates a separation between the content management system and the frontend application.

### GraphQL

GraphQL is used when the frontend needs specific, structured data from Drupal.

Instead of requesting an entire resource, the application can query only the fields it needs. This works particularly well for portfolio content where different pages may require different combinations of data.

For example, a project page might retrieve:

```text
Project
├── Title
├── Description
├── Image
├── Technologies
└── Project URL
```

This approach keeps data requests focused and allows the Next.js components to work with predictable content structures.

### REST API

The Drupal REST API provides another way for the application to interact with Drupal.

REST can be useful for resources or Drupal endpoints where a traditional API response is more appropriate than a GraphQL query.

Using both GraphQL and REST allows the project to demonstrate different approaches to consuming Drupal content rather than relying on a single integration method.

## Next.js Frontend

Next.js provides the presentation layer for the portfolio.

The application retrieves content from Drupal and transforms that content into pages and reusable React components.

The frontend is responsible for:

* Rendering portfolio content
* Creating responsive layouts
* Providing navigation and page structure
* Serving images from the Drupal site (the static export uses unoptimized images)
* Generating static pages
* Providing a modern user experience

Because the site is intended to run on GitHub Pages, the project is configured around a static deployment model rather than requiring a continuously running Node.js server.

## GitHub Pages Deployment

The Next.js application is built and deployed as a static site to GitHub Pages.

The general deployment flow is:

```text
Push to GitHub
      │
      ▼
GitHub Actions
      │
      ▼
Next.js Build
      │
      ▼
Static Export
      │
      ▼
GitHub Pages
```

This allows the portfolio to be hosted without maintaining a traditional application server.

## Why Drupal + Next.js?

Using Drupal and Next.js together provides a useful separation of responsibilities:

**Drupal handles the content.**

It provides structured content modeling, administration, and API access.

**Next.js handles the presentation.**

It provides the React-based interface, routing, component architecture, and static site generation.

This decoupled approach makes it possible to change the frontend without rebuilding the content management system, or to update portfolio content without changing the frontend code.

## Project Structure

```text
.
├── app/                 Next.js App Router: layout, home page, [...slug] pages, not-found, error
├── components/          React components (server by default; small client islands for interactivity)
├── graphql/             GraphQL queries and shared fragments
├── lib/                 Data fetching (GraphQL, REST), metadata, breadcrumbs, helpers
├── src/utils/           Small utilities (form field renderer, CMS image paths, body class)
├── types/               TypeScript types for the Drupal data
├── assets/              SCSS, fonts and the full FontAwesome library
├── e2e/                 Playwright tests, mock Drupal server and recorded fixtures
├── docs/                Audit reports and deployment guide
└── .github/workflows/   CI and deployment
```

Content pages are rendered on the server at build time from Drupal. Interactivity (the sticky header, the
mobile menu, the portfolio filter, the contact form submit, the image reveal) lives in small client components
that receive server-rendered content.

## Styling, Fonts and Icons

* **Bootstrap subset.** `assets/scss/bootstrap-subset.scss` imports only the Bootstrap modules in use: the grid,
  headings, forms, alerts, tables, helpers and utilities. Components nothing uses (buttons, cards, nav, badges,
  modals and so on) are left out, which keeps the stylesheet about 93 KB smaller. If CMS content ever needs one,
  add its line to that file, for example `@import "bootstrap/scss/buttons";`. A test fails if a class the site
  relies on stops resolving, and another if the stylesheet grows past its size budget.
* **Fonts.** Montserrat and Playfair Display are variable fonts served as WOFF2
  (`assets/fonts/*/*.woff2`); the original TTF files are kept as sources.
* **Icons.** The full FontAwesome library is committed on purpose so editors can use any icon. Its stylesheet is
  about 172 KB of the page CSS.
* **Favicon.** `app/favicon.ico` is a small multi-size icon made from the MD monogram.
* Images come from the Drupal site; every page preconnects to that host.

## Accessibility and SEO

* A skip link and a `<main>` landmark on every page; the mobile menu is keyboard and screen-reader accessible
  (it reports `aria-expanded`, closes with Escape, and the closed panel is `inert`); icon-only links have
  accessible names; external links open in a new tab safely.
* Automated checks run on every page with axe-core (WCAG 2.2 A/AA and best practices). The one known violation
  is a heading level in a Drupal block, tracked in `e2e/a11y.spec.ts`. Contrast over images, zoom and screen
  reader behavior still need manual checks; see the checklist in
  [docs/audits/testing-strategy.md](docs/audits/testing-strategy.md).
* Page titles and canonical URLs come from Drupal's metatags (including project pages and the 404 page). This is
  not the primary site, so it intentionally has no sitemap or `robots.txt`.
* Link previews: the share image comes from Drupal's Metatag "Image" (emitted as `<link rel="image_src">`, which
  sharing apps ignore) and is republished as `og:image` and `twitter:image`, with the page title and description.
  A page with no image in Drupal has no share image, so apps guess one from the page. After changing it, rebuild
  the site and refresh the preview cache (see [docs/deployment.md](docs/deployment.md#troubleshooting)).
* The breadcrumb trail always starts with Home, even if Drupal returns an empty trail; the build logs a warning
  when that happens.

## Getting Started

### Prerequisites

* Node.js 24 (see `.nvmrc`; `nvm use` picks it up) and npm
* A Drupal 11 site with the GraphQL and REST endpoints this frontend reads. Locally this project is developed
  against a DDEV site
* To run the end-to-end tests, nothing else: they use recorded fixtures instead of a live Drupal

### Install and configure

```bash
git clone <repository-url>
cd <project-directory>
npm ci
cp .env.example .env.local   # then edit the Drupal URLs
```

`.env.example` lists every variable:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_LOCAL_API_URL` | Origin of the Drupal site, no trailing slash |
| `NEXT_PUBLIC_LOCAL_API_GRAPHQL_URL` | Drupal GraphQL endpoint |
| `BASE_PATH` | Optional sub-path to serve from; leave unset for `https://<user>.github.io/` |

These values are compiled into the public JavaScript, so never put credentials in them. With DDEV, if ports 80
and 443 are taken, DDEV uses another router port (shown by `ddev describe`); include it in both URLs.

### Run the development server

```bash
npm run dev
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Development server, production build (static export to `out/`), serve a build |
| `npm run check` | Format check, lint, typecheck and unit tests (what CI runs first) |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `test:watch` / `test:coverage` | Vitest unit and component tests |
| `npm run test:e2e` | Playwright on Chromium; builds the site from fixtures first |
| `npm run test:a11y` | Only the axe accessibility scans |
| `npm run e2e:record -- <drupal url>` | Re-record the Drupal fixtures |
| `npm run knip` | Report unused files, exports and dependencies |

Git hooks (Husky): pre-commit formats and lints staged files; pre-push runs the typecheck.

## Testing

* **Unit and component tests** (Vitest, Testing Library) cover the logic and the interactive components.
* **End-to-end tests** (Playwright) build the real site against recorded Drupal responses and run it in a
  browser, including keyboard use, forms and axe accessibility scans. First time: `npx playwright install chromium`.
  Set `E2E_ALL_BROWSERS=1` to also run Firefox and WebKit.
* Details, the manual test checklist and known gaps: [docs/audits/testing-strategy.md](docs/audits/testing-strategy.md).

## Deployment

Pushes to `main` build and deploy the static site to GitHub Pages through GitHub Actions. Every change reaches
`main` through a pull request that must pass the format, lint, type, unit, end-to-end and audit checks; the
build only runs, and the site is only deployed, when those pass. A smoke test checks the live site afterwards.

Because Drupal content is read at build time, **after editing content in Drupal run the "Deploy Next.js Static
Export to GitHub Pages" workflow manually** to publish it. Full details, rollback options and troubleshooting:
[docs/deployment.md](docs/deployment.md).

## Making Changes

1. Branch from `main` and make the change. The Husky hooks format and lint staged files on commit and run the
   typecheck on push.
2. Run `npm run check` (and `npm run test:e2e` for anything visible).
3. Open a pull request. `main` is protected: it needs a pull request and both CI checks, "Format, lint, type
   check, test and audit" and "End-to-end tests (Chromium)", to pass. If you rename a job, update the required
   check in the repository ruleset.
4. After merging, the site deploys automatically; check the live pages.

When Drupal content or the GraphQL queries change, re-record the E2E fixtures with
`npm run e2e:record -- <drupal url>` and review the diff.

## Project Status

An audit and modernisation pass (October 2026) delivered, through reviewed pull requests:

| Area | What changed |
|---|---|
| Security and reliability | Next.js upgraded (0 production vulnerabilities); Drupal failures now fail the build loudly; `not-found` and `error` pages; generic contact form errors |
| Quality tooling | Prettier, ESLint cleanup, Husky hooks, Knip, Dependabot, a protected `main` |
| Tests | Unit and component tests; Playwright end-to-end and axe accessibility tests against recorded Drupal fixtures; a weekly cross-browser run |
| CI/CD | Format, lint, typecheck, unit, E2E and audit checks gate every deploy; export verification and a post-deploy smoke test |
| Architecture | Content rendered on the server at build time; small client islands for interactivity |
| Accessibility and metadata | Landmark, skip link, accessible menu, named links, page titles, canonical fix |
| Performance | Favicon 293 KB to 4.5 KB, WOFF2 fonts, preconnect, Bootstrap subset: about 400 KB less per page and a 16% smaller stylesheet (gzip) |
| Documentation | Audit reports, deployment guide, this README |

Still open: the footer heading level in Drupal, `prefers-reduced-motion` support, the Dependabot pull requests,
larger performance work (Drupal image styles) and manual accessibility testing. See
[docs/audits/implementation-plan.md](docs/audits/implementation-plan.md).

## Documentation

| Document | Contents |
|---|---|
| [docs/deployment.md](docs/deployment.md) | Pipeline, settings, releasing, rollback, troubleshooting, a known Drupal issue |
| [docs/audits/frontend-audit.md](docs/audits/frontend-audit.md) | Audit findings and outcomes |
| [docs/audits/implementation-plan.md](docs/audits/implementation-plan.md) | What was delivered and what is left |
| [docs/audits/testing-strategy.md](docs/audits/testing-strategy.md) | Test layers, fixtures, coverage, manual checks |
| [docs/audits/security-review.md](docs/audits/security-review.md) | Security findings and status |
| [docs/audits/performance-review.md](docs/audits/performance-review.md) | Lighthouse baseline, measured results of each optimisation, recommendations |
| [docs/audits/final-verification.md](docs/audits/final-verification.md) | Results of the final checks |

## Known limitations

* Content is a snapshot taken at build time; it updates only when the site is rebuilt.
* GitHub Pages cannot set security headers and serves every file with a 10-minute cache lifetime.
* The site needs a reachable Drupal at build time (not at runtime, except for the contact form submit).
* Simulated mobile load time is still slow (Lighthouse LCP about 7 to 8 s). The quick wins and the Bootstrap subset cut about 400 KB per page, but the Lighthouse score barely changed; the remaining levers (Drupal image styles, FontAwesome's size) are larger or are your choice. See the performance review.
* The site does not yet honor `prefers-reduced-motion`.
* If CMS content uses a Bootstrap component class that is not in the subset (for example `.btn`), add its module to `assets/scss/bootstrap-subset.scss`.

## Purpose

This project serves as both a personal portfolio and a demonstration of a **decoupled Drupal architecture**.

It showcases how Drupal 11 can be used as a headless CMS while Next.js provides the frontend experience, with GraphQL and REST APIs acting as the connection between the two systems.

The project also demonstrates how a content-driven Next.js site can be statically generated and deployed through GitHub Pages.

## License

This project is intended for personal and portfolio use.

See the repository for additional licensing information.
