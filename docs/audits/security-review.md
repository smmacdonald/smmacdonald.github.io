# Security review

Findings and remediation status as of **2026-10-21**.

## Scope and attack surface

A static site: no server runtime, no authentication, no cookies, no user accounts. The only visitor-facing
action that changes anything is the contact form, which sends a `POST` from the browser to Drupal
(`/webform_rest/submit`). Everything else is HTML, CSS and JavaScript served by GitHub Pages. The
integration points that matter are therefore the Drupal APIs, the build pipeline and the repository settings.

Not assessed: the Drupal installation itself (modules, permissions, PHP configuration), beyond what is visible
from the public endpoints. A review of the CMS is a separate piece of work.

## Summary

| Severity | Open | Notes |
|---|---|---|
| Critical | 0 | The one critical (Next.js) was fixed |
| High | 0 in this repository | The `braces` advisory affects development tooling only (see below) |
| Medium | 3 | Public GraphQL exposure unverified; no CAPTCHA/rate limit on the contact form; actions pinned by tag |
| Low | 2 open (S11, S12); 1 accepted (S8), 1 not fixable on this host (S9) | See table |

## Findings

| ID | Severity | Area | Finding | Evidence | Status |
|---|---|---|---|---|---|
| S1 | Critical | Dependencies | `next` 16.2.12 in a vulnerable range (RCE advisories for server runtimes and `next/og`, SSRF in image optimisation, cache poisoning, and others) | `npm audit --omit=dev` at the start | **Fixed**: 16.4.2. A static export does not run the affected server features, so real exposure was low, but the upgrade removed the question. |
| S2 | High | Dependencies | `postcss` advisories (XSS in stringify output, file read via `sourceMappingURL`) | `npm audit` at the start | **Fixed** with the upgrade and `npm audit fix` |
| S3 | Info | Dependencies | One advisory (`braces`, stack exhaustion on deeply nested glob patterns) that `npm audit` reports as 5 high-severity packages, all in the **dev-only** chain `eslint-config-next` then `@next/eslint-plugin-next`, `fast-glob`, `micromatch`, `braces` | `npm audit` | **Accepted.** Not shipped, patterns come from your own config, and npm's suggested fix downgrades `eslint-config-next` to v14. Re-check when `eslint-config-next` updates. CI audits production dependencies only. |
| S4 | Medium | Drupal exposure | `https://macdonaldesign.com/graphql` answers publicly (GET returned 200) | `curl` | **Open, unverified.** The frontend needs it public, but confirm that anonymous users cannot read **unpublished content or sensitive fields** through it, and decide whether schema introspection should be disabled in production. I did not probe production for either. A local check against DDEV is possible. |
| S5 | Medium | Contact form | Spam protection is a honeypot only (a `<select>` hidden with Bootstrap's `invisible` class). No CAPTCHA and no rate limiting in the frontend | `e2e/fixtures/rest/webform_rest_contact_fields_format_json.json`, `ContactFormShell.tsx` | **Open.** Consider Drupal's Honeypot time-limit/Captcha modules or server-side rate limiting; a static site cannot enforce either itself. |
| S6 | Medium | Supply chain | GitHub Actions pinned by tag (`@v4`), not commit SHA | `.github/workflows/*.yml` | **Open.** Dependabot PRs #3 to #7 propose newer majors; pin by SHA when merging them. |
| S7 | High | Information disclosure | The contact form showed Drupal's raw response body to the visitor on failure | `WebformContact.tsx` at the start | **Fixed**: generic message to the visitor, detail only in the browser console. Covered by a unit and an E2E test. |
| S8 | Low | HTML injection | Five components render Drupal HTML with `dangerouslySetInnerHTML` (`Basic`, `FeaturedColumn`, `Text`, `FooterBrandAndSocial`, `BlockReference`) | `grep dangerouslySetInnerHTML` | **Accepted.** Content is authored by you in the CMS. If untrusted editors are ever added, sanitise in one shared component first. |
| S9 | Low | Headers | No Content-Security-Policy, `X-Content-Type-Options` or similar headers. Only `server`, `cache-control`, `etag` and a permissive `access-control-allow-origin: *` (GitHub's default for Pages) are present | `curl -I` | **Won't fix**: GitHub Pages cannot set response headers. A different host or a CDN/proxy would be needed. Low impact for a static page with no authentication. |
| S10 | Low | External links | `target="_blank"` links had no `rel` | `SocialMediaElement.tsx` | **Fixed**: `rel="noopener noreferrer"` and an accessible name that says it opens a new tab |
| S11 | Low | Config exposure | `NEXT_PUBLIC_*` values (the Drupal origin) are compiled into the public bundle but stored as environment *secrets* | `deploy.yml` | **Open, cosmetic.** They are public by design; secrets only mask them in logs. Moving them to environment variables would be more honest and make build logs easier to debug. |
| S12 | Low | Repository settings | CodeQL is not enabled; Dependabot security updates are disabled (version updates are enabled) | `gh api repos/.../` | **Open.** Both are free for public repositories. |

## Verified as fine

| Check | Result |
|---|---|
| Secrets in the repository | None found by search; `.env*` is gitignored (with `.env.example` allowed); GitHub secret scanning **and push protection are enabled** |
| Production source maps | Not published (404 on three sampled chunk URLs) |
| Drupal CORS | Allows the Pages origin only. Requests with `Origin: https://smmacdonald.github.io` and with an unrelated origin both received `access-control-allow-origin: https://smmacdonald.github.io` (a fixed value, not a reflection of the request) |
| HTTPS | Enforced for the Pages site |
| Workflow permissions | Repository default is read-only; the `check` and `e2e` jobs declare `contents: read` |
| Environment secrets | Scoped to the `github-pages` environment, which only deploys from `main`; pull-request runs (including from forks) cannot read them, which is why PRs run `check` and `e2e` but not `build` |
| Branch protection | The `Protect main` ruleset blocks deletion and force pushes and requires a pull request with both CI checks green; the owner can bypass for emergencies |
| Test and report artifacts | The Playwright report and fixtures contain public content only (including the footer contact details already published on the site) and no credentials |
| Drupal responses | The GraphQL and REST responses seen during the audit were clean JSON; no PHP errors leaked into responses (the PHP warning reported from the Drupal logs stayed in the logs) |

## Contact form details

- Submission goes directly from the visitor's browser to Drupal, so Drupal must keep restricting the endpoint (CORS to the Pages origin is correctly set).
- A filled honeypot is rejected client-side before any request.
- A second submit while one is in flight is ignored.
- Failures show a fixed message; the server response is logged to the browser console only.

## Recommendations, in order

1. Verify what the public GraphQL endpoint exposes (S4): unpublished nodes, user data, introspection.
2. Add spam protection on the Drupal side (S5).
3. Enable CodeQL and Dependabot security updates (S12); pin actions by SHA when merging the Dependabot action PRs (S6).
4. Move the `NEXT_PUBLIC_*` values from environment secrets to variables (S11).
5. If a CSP or other headers ever matter, host behind something that can set them (S9).
