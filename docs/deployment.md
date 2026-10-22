# Deployment

How the site is built, checked, deployed and rolled back. Status as of **2026-10-21**.

## Overview

| | |
|---|---|
| Hosting | GitHub Pages, served from the repository `smmacdonald/smmacdonald.github.io` at `https://smmacdonald.github.io/` (HTTPS enforced, deployed by workflow) |
| Build | `next build` with `output: 'export'`: a static site in `out/` |
| Trigger | Push to `main` (every change reaches `main` through a pull request) or a manual run |
| Content source | Drupal 11 at `macdonaldesign.com`, read **at build time** |
| Runtime dependency on Drupal | Only the contact form's submit request, made from the visitor's browser |
| Branches | `main` only. (`develop`/`prod` branches belong to the Drupal site, not this repository.) |

Because content is fetched at build time, **editing content in Drupal does not change the site until you run
the workflow again** (see "Refreshing content"). Updates are expected every two to three months.

## The pipeline

Defined in `.github/workflows/deploy.yml`.

```text
pull request ->  check + e2e                      (no deploy, no secrets)
push to main ->  check + e2e -> build -> deploy -> smoke test
manual run   ->  same as push to main
```

| Job | Name (required check) | What it does |
|---|---|---|
| `check` | Format, lint, type check, test and audit | `npm ci`, `format:check`, `lint`, `typecheck`, unit and component tests with coverage thresholds, `npm audit --omit=dev --audit-level=high` |
| `e2e` | End-to-end tests (Chromium) | Installs Chromium, builds the site against the recorded fixtures and runs the Playwright suite (functional and axe checks). Uploads the HTML report (7 days). Uses no secrets and no live Drupal. |
| `build` | | Needs `check` and `e2e`. Checks the Drupal URLs are configured, builds with the real Drupal, then verifies the export (`404.html`, `about.html`, `contact.html`, `portfolio.html` exist and at least 8 HTML files were produced) and uploads the Pages artifact |
| `deploy` | | Deploys the artifact, then requests `/`, `/about` and `/portfolio` on the live URL (up to 10 attempts, 6 s apart); the run fails if any does not return 200 |

If a required check fails, `build` and `deploy` do not run, so a failing change cannot reach the live site. Deploys
queue behind each other and are never cancelled midway; pull-request runs are cancelled when superseded.

`.github/workflows/e2e-cross-browser.yml` runs the same E2E suite on Chromium, Firefox and WebKit every Monday
(09:00 UTC) and on demand. It does not deploy.

### Repository settings that make this safe

| Setting | Value |
|---|---|
| Ruleset "Protect main" | Blocks deleting `main` and force pushes; requires a pull request (0 approvals) and both CI checks to pass; repository admins can bypass for emergencies |
| Environment `github-pages` | Deployments allowed from `main` only; holds the two Drupal URL secrets |
| Workflow token | Read-only by default; `pages: write` and `id-token: write` are granted at the workflow level for the Pages deploy; `check` and `e2e` declare `contents: read` |
| Secret scanning and push protection | Enabled |
| Dependabot | Weekly version updates for npm and GitHub Actions |

If you rename a job, **update the ruleset's required check to the new name** or pull requests will wait forever
for a check that no longer exists.

### Configuration

| Name | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_LOCAL_API_URL` | Environment secret (`github-pages`) / `.env.local` | Origin of the Drupal site, no trailing slash |
| `NEXT_PUBLIC_LOCAL_API_GRAPHQL_URL` | Environment secret / `.env.local` | Drupal GraphQL endpoint |
| `BASE_PATH` | Optional environment variable | Sub-path to serve from. Leave unset for `https://<user>.github.io/` or a domain root |

`NEXT_PUBLIC_*` values are compiled into the public JavaScript, so they are public by design; they are stored as
secrets only to keep them out of logs. Never put credentials in them. `.env.example` lists the names.

## Releasing a change

1. Branch from `main`, make the change, run `npm run check` (and `npm run test:e2e` for UI changes) locally.
2. Open a pull request. Both required checks must pass; `build` and `deploy` are skipped on pull requests.
3. Merge. The pipeline builds against the live Drupal, deploys and runs the smoke test.
4. Verify manually (below).

Manual verification after a deploy: open `/`, `/about`, `/portfolio`, one project page, `/contact` and a bad URL
(for the 404 page); check the breadcrumbs, the portfolio filter, the mobile menu (toggle, Escape) and the sticky
header; check the footer links. Submitting the contact form sends a real message to Drupal, so do that
deliberately.

## Refreshing content

After changing content in Drupal: GitHub, Actions, "Deploy Next.js Static Export to GitHub Pages", **Run
workflow** on `main`. This rebuilds from the current `main` with the current Drupal data and deploys it. Check
the build log for `[breadcrumbs]` warnings (see the Drupal issue below).

## Rolling back

GitHub Pages has no rollback button. **These procedures are documented but have not been exercised; test one when
convenient.**

| Situation | Procedure | Notes |
|---|---|---|
| A code change broke the site | Open a pull request that reverts the merge commit (`git revert -m 1 <merge sha>`), merge it. The pipeline redeploys | Takes about 3 minutes; the checks still run |
| Urgent, and the pipeline itself is the problem | The repository owner can bypass the ruleset to push a revert directly to `main` | Last resort |
| A content problem (bad data from Drupal) | Fix it in Drupal (or clear its caches) and run the workflow again | Re-running an *old* run rebuilds from that old commit but with **today's** Drupal data, so it is not a content snapshot |
| Redeploy a previous build exactly as it was | Re-run only the `deploy` job of the earlier successful run | The Pages artifact is kept for the action's default retention (one day for `upload-pages-artifact`), so this only works shortly after the original run |

A failed deploy leaves the previous version live: the Pages artifact is only published by the `deploy` job after
the build succeeded, and a failed smoke test fails the run but does not remove the deployed site.

## Local development

```bash
nvm use                      # Node 24 (.nvmrc)
npm ci
cp .env.example .env.local   # then fill in your Drupal URLs
npm run dev
```

With DDEV the Drupal URL is normally `https://<project>.ddev.site`. If something else already owns ports 80
and 443 on your machine, DDEV falls back to another router port (for example `:33001`; `ddev describe` shows the
URL) and that port must be part of both URLs in `.env.local`. Node trusts DDEV's mkcert certificate on this setup;
if yours does not, set `NODE_EXTRA_CA_CERTS` to the mkcert root CA.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `fetch failed` / `ECONNRESET` for the Drupal host while building or running | Wrong port or Drupal not running. Check `ddev describe` and `.env.local` |
| Local links look like `/:33001/portfolio/...` | Drupal behind a non-standard port strips the host but leaves the port on relative URLs. Remove the port (free ports 80/443) or ignore it locally; it does not occur in production |
| A local build shows old Drupal content | Next keeps a build-time fetch cache in `.next/cache`. Delete that folder. CI starts clean, so deploys are not affected |
| Build fails with `403` on `webform_rest/contact/fields` | Anonymous users lack access to the contact webform's configuration. In Drupal give Anonymous the webform's "configuration" access (or the "Access any webform configuration" permission) |
| Build fails: "The Drupal sitemap returned no routes" | `/rest/headless-sitemap` returned an empty list; check the Drupal view and caches |
| Pull request waits for a check that never reports | The ruleset requires a check name that no longer exists; update the ruleset |
| E2E fails after a Drupal or query change | Re-record fixtures: `npm run e2e:record -- <drupal url>` and review the diff |
| A shared link shows the wrong thumbnail (for example the first slider image) | The page has no `og:image`, so the sharing app guesses an image. Drupal's Metatag "Image" is emitted as `<link rel="image_src">`; this site republishes it as `og:image`/`twitter:image`, **only for pages that have one set in Drupal** (check the GraphQL `metatag` list for an `image_src` entry). Set it in Drupal (per node, or in Metatag's global/content-type defaults), run the workflow to rebuild, then refresh the app's cache: LinkedIn Post Inspector, Facebook Sharing Debugger; Slack and iMessage cache for a while. The image should be about 1200 x 630 px; a 600 x 400 image gives a small preview on some apps |
| A project title (or filter label) shows `&amp;` or another HTML escape | Drupal's **REST views** HTML-escape every field ("Earth &amp; Sky") while GraphQL returns plain text. The portfolio data is decoded at build time with `decodeStringFields` (`lib/text.ts`) in `PreviousWork` and `FeaturedWork`. Any new plain-text field read from a REST view needs the same call; do **not** decode fields that hold HTML (rich text), which the browser should render as they are |
| Commit hook fails | Pre-commit runs Prettier and ESLint on staged files; pre-push runs the typecheck. Fix the reported issue; do not bypass with `--no-verify` |

## Known Drupal-side issue: breadcrumbs

**Status (2026-10-21): resolved on the live site; root cause not recorded.** After PR #17 merged and the site
was rebuilt, every page shows its breadcrumbs, and production's GraphQL now returns full trails
(`/about`: Home; `/portfolio/macdonaldesign`: Home, Portfolio). What changed on the Drupal side to fix it was not
recorded here; if you know (cache clear, redirect, module update), add it below, because the same failure can
come back. The build now logs `[breadcrumbs]` when it does, and the Home link no longer depends on it.

**Symptom (at the time):** on the live site `/about`, `/portfolio` and project pages lost their "Home" breadcrumb
and its spacing, while `/contact` kept it.

**What was verified:** production's GraphQL answers the breadcrumb query consistently (6 of 6 requests) with an
**empty list** for `/about`, `/portfolio` and `/portfolio/macdonaldesign`, and `[{Home}]` for `/contact`. A local DDEV
Drupal returns Home for all of them. The Drupal log shows `foreach() argument must be of type array|object, null
given` from `graphql_compose_routes/.../DataProducer/Breadcrumbs.php`.

**What the module code does** (read from the local copy, `graphql_compose` `3.0.0-alpha4`): the breadcrumbs
producer asks a buffer to run an internal sub-request for each page. If that sub-request does not come back as a
`SubRequestResponse` (for example it ends in a redirect that is not local, an access or error response, or an
exception), the buffer returns `NULL` for every item, and the loop over the result (`foreach`, line 126) then
fails with the warning above; GraphQL returns an empty list. The warning's line numbers (closure at line 120,
`foreach` at line 126) match the local `alpha4` file exactly, so production most likely runs the **same module
code** as the local site. The difference between the two sites is therefore in what happens inside the
sub-request on production, not in the module version.

A related upstream report, graphql_compose issue
[#3512463](https://git.drupalcode.org/project/graphql_compose/-/work_items/3512463), describes empty breadcrumbs
for nodes without a menu item. It does not mention this warning and has no maintainer response, so it is **not a
confirmed match**.

**What is not known:** why the sub-request fails for only some pages on production, and the exact production
module version.

**Next steps, in order:**

1. Clear all caches, query `/graphql` for `/about` again, and look in the Drupal log for other entries at the same
   time (access denied, redirect, page not found, PHP errors) that explain the failed sub-request.
2. Check whether `/about`, `/portfolio` and the project nodes have URL redirects (Redirect module) or path-alias
   differences compared with `/contact`, and which breadcrumb builders are enabled (`drush pml | grep -i breadcrumb`).
3. Compare the installed `drupal/graphql_compose` version (`composer show`) with `3.0.0-alpha4`.
4. If it persists, report it upstream with the stack trace and the module versions.
5. Rebuild the site afterwards.

**Mitigation in this repository** (PR #17, merged): the Home breadcrumb is always rendered, independent of Drupal,
and the build logs `[breadcrumbs] Drupal returned no Home crumb for <path>` when Drupal supplied none. Intermediate
crumbs, such as "Portfolio" on project pages, still come from Drupal.
