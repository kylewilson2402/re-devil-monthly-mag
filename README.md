# RED CHAPTERS — Vol. 01

### *The Season That Broke Us*

A print-ready Manchester United fan magazine, rebuilt from the ground up against
[`RED_CHAPTERS_BUILD_SPEC.md`](./RED_CHAPTERS_BUILD_SPEC.md). The brief: close the
gap between a working brutalist prototype and a publication that could sit on a
shelf next to *The Blizzard* or a Rizzoli football monograph — in service of three
masters, in order: **readability, storytelling, visual impact**.

It is built as a **system, not a set of hand-placed pages**: a design-token file,
a component library, and an HTML/CSS source that pours content into that system and
renders to PDF through **Paged.js** driven by headless Chromium.

---

## Quick start

```bash
npm install            # restores deps (Paged.js, fonts, sharp, playwright-core)
npm run images         # preprocess photography -> assets/img/processed  (run once)
npm run build          # renders BOTH profiles into dist/
```

Individual targets:

```bash
npm run build:digital  # dist/red-chapters-vol01-digital.pdf  (A4, sRGB, screen)
npm run build:print    # dist/red-chapters-vol01-print.pdf    (3mm bleed + crop/reg marks)
npm run qa             # renders digital + a PNG of every page into build/ for visual QA
```

The build uses the environment's preinstalled Chromium (`scripts/find-chrome.js`),
serves the source over a throwaway localhost server (Paged.js re-fetches stylesheets,
which `file://` blocks), runs pagination, and prints to PDF.

---

## The two deliverables (spec §12)

| | Digital | Print |
|---|---|---|
| File | `dist/red-chapters-vol01-digital.pdf` | `dist/red-chapters-vol01-print.pdf` |
| Trim | 210 × 297 mm (A4) | 210 × 297 mm (A4) |
| Sheet | 210 × 297 mm | 222 × 309 mm (trim + 3 mm bleed + crop-mark gutter) |
| Bleed | — | 3 mm, full-bleed art extends into it |
| Marks | — | crop + registration (`marks: crop cross`) |
| Colour intent | sRGB | CMYK-intent build values flagged in CSS |
| Pages | 17 | 17 |

Both render from **one source** (`src/magazine.html`); the profile is switched by a
build flag that sets `html[data-profile]` and injects the print `@page` rule.

---

## Architecture

```
src/
  magazine.html        the whole issue — content poured into the system
  css/
    fonts.css          self-hosted @font-face (no CDN calls in a print pipeline)
    tokens.css         design tokens: palette, spacing scale, type scale, geometry
    base.css           @page, the 12-col grid, 4mm baseline, furniture, image treatment
    components.css      the component library (spec §11)
scripts/
  process-images.js    sharp: consistent tonal baseline + duotone variants
  find-chrome.js       locate the environment's Chromium for Playwright
build.js               render pipeline (Paged.js + Chromium -> PDF, two profiles)
assets/
  fonts/               self-hosted woff2 (Archivo, Archivo Black, Source Serif 4)
  img/raw/             source frames extracted from the prototype
  img/processed/       toned + duotone outputs (sharp)
dist/                  the two PDFs
```

### The page model

Every page is one `<section class="page">` — exactly one trimmed sheet. All page
content is absolutely positioned (`.live` grid, `.layer` blocks, injected furniture),
so a page's block-flow height stays fixed and Paged.js emits **exactly one sheet per
page**. Pages are atomic (`break-inside: avoid`) and the live area is clamped
(`overflow: hidden`) so a page can never accidentally fragment into a second sheet.

Running headers and folios are injected per page by a small script from
`data-chapter` / `data-section` attributes, and sit in the margin zones above and
below the live area. Spine-aware margins (wider on the inside/spine edge) are driven
by `data-side="left|right"`.

---

## Design system

**Palette (§9) — red is punctuation, never a wall.**
`--red #C8102E` · `--ink #0A0A0A` · `--ivory #F4F1EA` (warm paper white) ·
`--graphite #2B2B2B` · `--gold #C8A24B` (ceremonial only — back cover).

**Type (§3) — two families.** *Archivo / Archivo Black* (grotesque: masthead,
headlines, furniture, tabular stats) against *Source Serif 4* (editorial body,
standfirst, drop caps). The serif body against grotesque furniture is the move that
lifts it above the all-sans prototype.

**Grid & rhythm (§2).** 12 columns, 5 mm gutter, asymmetric margins, everything
snapped to a **4 mm baseline**. Spacing uses a fixed token scale only
(`--space-2xs … --space-2xl`) — no arbitrary gaps.

### Component library (`components.css`, spec §11)

`masthead` · `chapter-opener` · `kicker` · `deck` · `standfirst` · `pull-quote` ·
`stat-block` (the atomic unit) · `stat-rail` · `stat-row` · `transfer` (front-three
cards) · `league-table` (United highlighted with a thin red edge bar, not a fill) ·
`timeline` (spine + W/L tokens) · `comparison-bar` · `rating-bar` · `sidebar` ·
`caption` · `contents` · `calls` (numbered predictions) · `callout` (editor's call) ·
`led-row` (two-season ledger) · `back-cover`. Each is defined once and reused — that
is what guarantees consistency.

---

## Flatplan & pacing (spec §6)

Dark image-led openers alternate with airy light analysis pages so no two
consecutive spreads feel the same.

| Pg | Spread | Treatment |
|---|---|---|
| 1 | Cover | full-bleed, two-tone hero, masthead device |
| 2 | Contents | typographic index, large chapter numerals |
| 3 | Editor's Letter | serif body, red pull-quote, drop cap |
| 4 | Ch.01 — How It All Fell Apart | dark feature opener |
| 5 | The Collapse | 3-column serif + dominant stat row |
| 6 | Casemiro — One More Year | dark portrait opener |
| 7 | Casemiro analysis | body + vertical stat rail + pull-quote |
| 8 | Carrick — The Return of a Red | dark opener |
| 9 | Carrick analysis | stat rail + editor's call + run breakdown |
| 10 | Bruno — Assists | dark opener |
| 11 | Bruno — The Record | comparison bars (21 / 20 / 20) |
| 12 | Ten Defining Moments | graphite timeline, W/L tokens |
| 13 | The Front Three & The Table | transfer cards + league table |
| 14 | By The Numbers | graphite, two-season ledger, dominant red 21 |
| 15 | The Shape That Saved Us | tactical 3-4-3 SVG |
| 16 | What Comes Next | six numbered predictions |
| 17 | Back Cover | next-issue teaser, gold accent, duotone |

---

## Photography (spec §7)

`scripts/process-images.js` applies one tonal baseline (restrained saturation, a
touch of contrast, light sharpen) so every photo belongs to the same magazine, and
bakes **black→red duotone** variants (a proper luminance gradient map) used as the
archival signature on the editor's letter and back cover. Full-colour is reserved for
hero/contemporary images. Hard edges only — no shadows, rounding or borders.

**Honest note on resolution.** The source frames inherited from the prototype are
modest (535–1283 px on the long edge). Upscaled with a Lanczos kernel they land at
~168–218 effective DPI at full-bleed A4 — below the 300 DPI ideal in §7. The weakest
crops are used as secondary/duotone elements rather than full-bleed heroes, and the
per-asset effective DPI is reported in `assets/img/processed/manifest.json`. Swapping
in 300 DPI originals requires no layout changes — only re-running `npm run images`.

---

## Known constraints

- **Fonts** are the free, OFL substitutes the spec nominates (Archivo / Source Serif 4)
  rather than the licensed Söhne / Neue Haas Grotesk — self-hosted, fully embedded.
- **CMYK.** The print build flags CMYK target values in CSS comments and uses 100% K
  for body text; a final prepress pass (e.g. Ghostscript/Acrobat) would convert the
  RGB PDF to a CMYK profile and set explicit TrimBox/BleedBox.
- **Imposition.** 17 pages; a saddle-stitched run pads to a multiple of four — the
  printer's imposition step adds the blanks.
- **Tagging.** Logical reading order and image `alt` text are authored in the source;
  full PDF/UA tag-tree embedding is a post-process step on the digital build.

---

*Built spread by spread, QA'd against the §13 checklist, then shipped. Glory Glory.*
