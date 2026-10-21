# Performance review

Measurements and findings as of **2026-10-21**, taken against the live site
(`https://smmacdonald.github.io/`) before any performance work. No optimisation has been done yet; the
numbers below are the **baseline** to compare against.

## Hosting model

A static export on GitHub Pages behind GitHub's CDN: no server runtime, no ISR, no image optimisation API
(`next/image` runs with `unoptimized`). Responses are gzip-compressed. **Every file, including the hashed
`/_next/static/*` assets, is served with `cache-control: max-age=600`** (10 minutes), and GitHub Pages does not
let you change that. Source maps are not published (checked three chunk URLs: 404).

## Method and limits

- Lighthouse 13.5.0 using Playwright's bundled Chromium (build 1248), headless, mobile preset (simulated slow 4G, 4x CPU slowdown) and
  desktop preset, against the live URLs.
- Mobile: 3 runs per page, medians reported with the per-run range. Desktop: 1 run per page.
- **Lab data, not real-user data.** The simulated mobile profile is deliberately pessimistic. Scores varied
  noticeably between runs (home mobile performance score 61, 74, 75), so treat differences under about 10
  points as noise. There is no field data (CrUX) for a site this small.
- The pages measured: `/` and `/portfolio`. The project and contact pages were not measured.

## Results

| Page / profile | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Speed Index | Transfer | Requests |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` mobile (median of 3) | 74 (61 to 75) | 98 | 100 | 100 | 1.2 s | 9.3 s (8.3 to 10.0) | 11 ms | 0.041 | 3.1 s | 1.8 MB | 36 |
| `/portfolio` mobile (median of 3) | 76 (75 to 76) | 98 | 100 | 100 | 1.2 s | 7.8 s | 8 ms | 0.003 | 1.5 s | 1.7 MB | 38 |
| `/` desktop (1 run) | 95 | 98 | 100 | 100 | 0.3 s | 1.6 s | 0 ms | 0.002 | 0.3 s | 1.9 MB | 49 |
| `/portfolio` desktop (1 run) | 96 | 98 | 100 | 100 | 0.3 s | 1.3 s | 0 ms | 0.025 | 0.8 s | 2.8 MB | 75 |

Interaction cost is excellent (TBT 0 to 11 ms) and layout stability is good (CLS under 0.05). Server response is
fast (TTFB about 15 ms). The weak spot is **simulated mobile LCP (7.8 to 10 s)**.

How to read the LCP number: the LCP element is the full-width hero section (`section#pid-47`), painted with a
CSS `background-image` from `macdonaldesign.com` (a 152 KB JPEG). On the real, unthrottled connection its
timeline is short (time to first byte 78 ms, load delay about 55 ms, image download 135 to 470 ms, render delay
15 to 500 ms; about 0.6 to 0.8 s in total). The 8 to 10 s figure is Lighthouse's *simulated* slow-4G result,
which penalises the total bytes that must arrive over a 1.6 Mbps link. It is a useful relative measure and a
reason to reduce bytes, but it is not what a visitor on a normal connection experiences.

### Where the bytes go (home page, mobile run)

| Type | Transferred |
|---|---|
| Fonts | 874 KB (49%) |
| Images | 384 KB |
| Other (the favicon) | 293 KB |
| Scripts | 160 KB |
| Stylesheets | 77 KB (406 KB uncompressed in one file) |
| Documents and fetches | 18 KB |

Largest single items: `fa-regular-400.woff2` 349 KB, `favicon.ico` 293 KB, `Montserrat-VariableFont_wght.ttf`
278 KB, `hero-img-abstract.jpg` 152 KB, `PlayfairDisplay-VariableFont_wght.ttf` 133 KB, `fa-brands-400.woff2` 113 KB.

### JavaScript

About 195 KB gzipped (about 641 KB raw) per page, mostly the framework (React DOM about 70 KB gzipped, Next's
client runtime about 44 KB). The server-component refactor reduced client JavaScript by only 1 to 2 KB, as
expected; its benefit was content in the HTML, not bundle size. Lighthouse estimates 28 KiB of unused and 14 KiB
of legacy JavaScript.

## Findings

| # | Priority | Finding | Evidence | Recommendation | Expected effect | Effort |
|---|---|---|---|---|---|---|
| 1 | High | `app/favicon.ico` is a **610 x 436 PNG renamed `.ico`, 293 KB**, loaded on every page | `file app/favicon.ico`; Lighthouse network list | Replace with a real small `.ico`/PNG/SVG (a few KB) | About 290 KB less on every page load (measured size, not an estimate) | Low |
| 2 | High | Site fonts are **TTF** variable fonts (Montserrat 672 KB and Playfair Display 295 KB on disk) | `assets/scss/fonts.scss`; 278 KB and 133 KB transferred | Convert to WOFF2 (and subset if the italic or unused axes are not needed) | WOFF2 is typically 30 to 50% smaller than TTF; **estimate, to be re-measured** | Low |
| 3 | Medium | One 406 KB stylesheet: all of Bootstrap is imported (`@use "bootstrap/scss/bootstrap"`) | Built CSS; Lighthouse "unused CSS" est. 72 KiB | Import only the Bootstrap modules in use | Lighthouse estimate: 72 KiB, plus about 410 ms of render blocking | Medium |
| 4 | Medium | Hero and card images come from the Drupal host as full-size JPEG/PNG; cards show them at about 97 x 78 px | Lighthouse image-delivery insight (est. 88 KiB) | Use Drupal image styles (WebP, correct sizes) and `srcset` | Lighthouse estimate: 88 KiB | Medium (Drupal config) |
| 5 | Medium | No `preconnect` to `macdonaldesign.com` although the LCP image comes from there | Lighthouse LCP discovery | Add `<link rel="preconnect" href="https://macdonaldesign.com">` | Saves a connection setup (about 330 ms simulated RTT) | Low |
| 6 | Medium | Every asset is cached for only 10 minutes | Response headers; Lighthouse cache insight est. 1,021 KiB on repeat visits | Not fixable on GitHub Pages. Only a CDN or host in front with long cache lifetimes for hashed assets would change it | Repeat-visit transfer only | n/a (platform) |
| 7 | Low | FontAwesome regular and brands fonts (349 KB and 113 KB) load even though few icons are used | Network list | **Kept on purpose**: editors may use any icon. Revisit only if you want a subset | Up to about 460 KB | Medium |
| 8 | Low | `font-display: swap` is set, but Lighthouse still estimates 50 ms of font-display savings | Lighthouse | Self-hosted WOFF2 with `<link rel="preload">` for the primary font | Small | Low |

## Suggested order and a budget

1. Items 1, 2, 5 (all low effort). Re-run the same Lighthouse commands and record the change here.
2. Item 4 with Drupal image styles, then item 3.

A reasonable budget for this site, to check by hand after changes: simulated-mobile LCP under 4 s, total
transfer under 1 MB per page, TBT under 200 ms, CLS under 0.1. Do not treat the Lighthouse score as a guarantee;
it varied by 14 points between identical runs.

## Reproducing

Lighthouse was installed in a scratch directory (not added to the project) and run against the live URLs with
the Chromium that Playwright downloads:

```bash
npm install lighthouse            # in a scratch directory
npx lighthouse https://smmacdonald.github.io/ --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new" --output=json --output-path=./home-mobile-1.json
npx lighthouse https://smmacdonald.github.io/ --preset=desktop ...   # desktop profile
```

Lighthouse CI was not added: the problem it would solve (regression gating) does not yet have a baseline
worth gating, and its scores are noisy at this size.
