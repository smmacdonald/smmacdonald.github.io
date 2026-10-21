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

## Documentation

| Document | Contents |
|---|---|
| [docs/deployment.md](docs/deployment.md) | Pipeline, settings, releasing, rollback, troubleshooting, a known Drupal issue |
| [docs/audits/frontend-audit.md](docs/audits/frontend-audit.md) | Audit findings and outcomes |
| [docs/audits/implementation-plan.md](docs/audits/implementation-plan.md) | What was delivered and what is left |
| [docs/audits/testing-strategy.md](docs/audits/testing-strategy.md) | Test layers, fixtures, coverage, manual checks |
| [docs/audits/security-review.md](docs/audits/security-review.md) | Security findings and status |
| [docs/audits/performance-review.md](docs/audits/performance-review.md) | Lighthouse baseline and recommendations |
| [docs/audits/final-verification.md](docs/audits/final-verification.md) | Results of the final checks |

## Known limitations

* Content is a snapshot taken at build time; it updates only when the site is rebuilt.
* GitHub Pages cannot set security headers and serves every file with a 10-minute cache lifetime.
* The site needs a reachable Drupal at build time (not at runtime, except for the contact form submit).
* Simulated mobile load time is still slow (Lighthouse LCP about 7 to 8 s); the quick wins cut about 390 KB per page, and larger items (the 406 KB stylesheet, Drupal image styles) remain. See the performance review.

## Purpose

This project serves as both a personal portfolio and a demonstration of a **decoupled Drupal architecture**.

It showcases how Drupal 11 can be used as a headless CMS while Next.js provides the frontend experience, with GraphQL and REST APIs acting as the connection between the two systems.

The project also demonstrates how a content-driven Next.js site can be statically generated and deployed through GitHub Pages.

## License

This project is intended for personal and portfolio use.

See the repository for additional licensing information.
