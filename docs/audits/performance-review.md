# Performance review

Measurements and findings as of **2026-10-21**, taken against the live site
(`https://smmacdonald.github.io/`). The **Results** table is the baseline taken before any performance work;
"After the quick wins" (below) records the re-measurement after PR #19 was deployed, and "After the Bootstrap
subset" the one after PR #21.

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

## After the quick wins (PR #19, deployed 2026-10-21)

Same method as the baseline, against the live site (3 mobile runs and 1 desktop run per page; medians). Per-run
Lighthouse scores vary by up to 14 points, so only the byte counts below are reliable; time-based changes smaller
than the run-to-run range are noise.

| Page / profile | Transfer | of which fonts | of which favicon | Perf score (runs) | Simulated LCP | Speed Index |
|---|---|---|---|---|---|---|
| `/` mobile, before | 1,806 KB | 874 KB | 293 KB | 74 (61, 74, 75) | 9.3 s | 3.1 s |
| `/` mobile, after | **1,413 KB** (-394 KB, -22%) | 769 KB (-106 KB) | 4.5 KB (-288 KB) | 75 (75, 75, 76) | 8.0 s | 1.3 s |
| `/portfolio` mobile, before | 1,701 KB | 874 KB | 293 KB | 76 (76, 76, 75) | 7.8 s | 1.5 s |
| `/portfolio` mobile, after | **1,307 KB** (-394 KB, -23%) | 769 KB (-106 KB) | 4.5 KB (-288 KB) | 76 (76, 76, 76) | 7.4 s | 2.3 s |
| `/` desktop, before / after (1 run each) | 1,890 / **1,499 KB** (-392 KB) | 874 / 769 KB | 293 / 4.7 KB | 95 / 93 | 1.6 / 1.7 s | 0.3 / 0.3 s |
| `/portfolio` desktop, before / after (1 run each) | 2,751 / **2,363 KB** (-388 KB) | 874 / 769 KB | 293 / 4.6 KB | 96 / 95 | 1.3 / 1.6 s | 0.8 / 0.3 s |

What this shows:

- **The byte savings are real and match the prediction:** about 390 KB less on every page, from the favicon
  (-288 KB) and the fonts (-106 KB). Confirmed from Lighthouse's network list on the live site: Montserrat now
  arrives as `font/woff2` at 201 KB (was `font/ttf` at 278 KB), Playfair as `font/woff2` at 104 KB (was 133 KB),
  the favicon is 4.5 KB, and the page preconnects to `https://macdonaldesign.com`.
- **The Lighthouse scores did not meaningfully change** (home mobile median 74 to 75, portfolio 76 to 76; the
  desktop differences are within single-run noise). The favicon and fonts were never on the critical rendering path,
  so removing them saves data and bandwidth but not render time. Render blocking is unchanged (about 410 ms
  estimated), because it is caused by the 406 KB stylesheet, which these changes did not touch.
- **Observed LCP resource load** (unthrottled) dropped in the run shown (467 to 145 ms) but individual runs vary
  from 135 to 470 ms, so this is not a reliable signal either.
- The font saving over the wire is **21 to 27%**, not the 30 to 50% first estimated: GitHub already gzips the
  TTF files in transit, so WOFF2's advantage over gzipped TTF is smaller than its advantage over raw TTF (68% on
  disk).
- Remaining simulated-mobile LCP (about 7.4 to 8 s) is therefore not explained by these assets. The most likely
  contributors, which have not yet been tested, are the render-blocking 406 KB stylesheet and total bytes
  competing on the simulated 1.6 Mbps link (fonts are still 769 KB, mostly FontAwesome at 462 KB).

## After the Bootstrap subset (PR #21, deployed 2026-10-21)

The site imported all of Bootstrap; it now imports only the modules it uses (grid, headings, forms, alerts,
tables, helpers, utilities). FontAwesome's CSS (about 172 KB raw) is unchanged on purpose.

| | Before | After |
|---|---|---|
| Main stylesheet, raw | 405.6 KB | **312.4 KB** (-93 KB, -23%) |
| Main stylesheet, gzip -9 | 73.6 KB | **61.7 KB** (-12 KB, -16%) |
| CSS transferred on the live site (Lighthouse) | 76.8 KB | **64.3 KB** (-12.5 KB) |
| Lighthouse "unused CSS" estimate | 72 KiB | 60 KiB |
| Lighthouse render-blocking estimate | 410 ms | 410 to 430 ms (unchanged) |

**Visual check:** 21 screenshots (6 pages at 3 viewports, the open mobile menu, the scrolled header, the contact
error state) taken before and after differ by 0 pixels beyond anti-aliasing noise; the screenshot harness was first
shown to be deterministic. The baselines are not committed because they would differ between macOS and Linux.

**Lighthouse scores, mobile:**

| Runs | n | Median | Range | Runs scoring 77 or more |
|---|---|---|---|---|
| Before the Bootstrap change (baseline and quick wins, both pages) | 12 | 75.5 | 61 to 76 | 0 |
| After the Bootstrap change (both pages) | 18 | 76 | 75 to 83 | 5 (77, 80, 81, 83, 83) |

By page, 9 runs each after the change: `/` scored 75 in 7 runs plus 77 and 83 (median 75, LCP median 8.0 s);
`/portfolio` scored 75 to 76 in 6 runs plus 80, 81 and 83 (median 76, LCP median 7.2 s, range 4.7 to 7.7 s).

**Reading:** the CSS bytes fell by the predicted amount, but the **typical Lighthouse score did not change**
(the median moved by half a point). High scores of 77 to 83 appeared only after the change (5 of 18 runs, none
of 12 before), which is suggestive of an intermittent improvement, but with this sample and this much run-to-run
noise it is **not conclusive** and should not be reported as a gain. Render blocking did not change, so the
stylesheet is probably blocking for a reason other than Bootstrap's size (FontAwesome's CSS is still 172 KB raw).
The simulated mobile LCP is still about 7 to 8 s at the median.

## Findings

Status after PR #19: items 1, 2 and 5 are done. After PR #21: item 3 is partly done (Bootstrap trimmed;
FontAwesome's CSS remains).

| # | Priority | Finding | Evidence | Recommendation | Expected effect | Effort |
|---|---|---|---|---|---|---|
| 1 | High | `app/favicon.ico` is a **610 x 436 PNG renamed `.ico`, 293 KB**, loaded on every page | `file app/favicon.ico`; Lighthouse network list | Replace with a real small `.ico`/PNG/SVG (a few KB) | About 290 KB less on every page load (measured size, not an estimate) | Low **Done**: 4.5 KB, -288 KB measured |
| 2 | High | Site fonts are **TTF** variable fonts (Montserrat 672 KB and Playfair Display 295 KB on disk) | `assets/scss/fonts.scss`; 278 KB and 133 KB transferred | Convert to WOFF2 (and subset if the italic or unused axes are not needed) | **Measured: 21 to 27% less over the wire (-106 KB on a typical page); 68% smaller on disk.** Subsetting not done | Low **Done** (WOFF2); subsetting open |
| 3 | Medium | One 406 KB stylesheet: all of Bootstrap is imported (`@use "bootstrap/scss/bootstrap"`) | Built CSS; Lighthouse "unused CSS" est. 72 KiB | Import only the Bootstrap modules in use | Lighthouse estimate: 72 KiB, plus about 410 ms of render blocking. **Measured: -93 KB raw, -12 KB transferred; render blocking unchanged; score unchanged at the median** | Medium **Done** (Bootstrap); FontAwesome CSS kept |
| 4 | Medium | Hero and card images come from the Drupal host as full-size JPEG/PNG; cards show them at about 97 x 78 px | Lighthouse image-delivery insight (est. 88 KiB) | Use Drupal image styles (WebP, correct sizes) and `srcset` | Lighthouse estimate: 88 KiB | Medium (Drupal config) |
| 5 | Medium | No `preconnect` to `macdonaldesign.com` although the LCP image comes from there | Lighthouse LCP discovery | Add `<link rel="preconnect" href="https://macdonaldesign.com">` | Saves a connection setup (about 330 ms simulated RTT). Not separately measurable in the noisy scores | Low **Done** |
| 6 | Medium | Every asset is cached for only 10 minutes | Response headers; Lighthouse cache insight est. 1,021 KiB on repeat visits | Not fixable on GitHub Pages. Only a CDN or host in front with long cache lifetimes for hashed assets would change it | Repeat-visit transfer only | n/a (platform) |
| 7 | Low | FontAwesome regular and brands fonts (349 KB and 113 KB) load even though few icons are used | Network list | **Kept on purpose**: editors may use any icon. Revisit only if you want a subset | Up to about 460 KB | Medium |
| 8 | Low | `font-display: swap` is set, but Lighthouse still estimates 50 ms of font-display savings | Lighthouse | Self-hosted WOFF2 with `<link rel="preload">` for the primary font | Small | Low |

## Suggested order and a budget

1. Items 1, 2, 5: **done** (results above).
2. Item 3 (Bootstrap) is done and did not move the median score. What remains are item 4 (Drupal image styles) and
   FontAwesome's size (your choice: its CSS is 172 KB raw and its fonts 462 KB). Re-measure after each, change one
   thing at a time, and use at least 9 runs per page: 3 runs were not enough to separate effects from noise.

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
