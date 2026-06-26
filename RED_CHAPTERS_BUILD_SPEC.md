# RED CHAPTERS — PRODUCTION REBUILD SPECIFICATION

**A complete implementation brief for Claude Code**

You are rebuilding *Red Chapters*, a Manchester United fan magazine, from the ground up. This document is your art director's brief and your senior UX designer's technical spec rolled into one. Read all of it before you write a single line of code. You are not generating pages. You are operating as an editorial team — art director, picture editor, sub-editor, and production manager working in sequence on every spread.

The existing issue (Vol. 01, "The Season That Broke Us") already has a brutalist editorial identity. It works as a prototype. It does not yet read as a publication that could sit on a shelf next to *FourFourTwo*, *The Blizzard*, or a Rizzoli football monograph. Your job is to close that gap. Every decision below exists to serve three masters, in this order: **readability, storytelling, visual impact**. Decoration that serves none of those is to be removed.

---

## 0. HOW TO BUILD THIS

Build the magazine as a print-ready PDF using an HTML/CSS-to-PDF pipeline. Use **Paged.js** (or **WeasyPrint** if a Python-only pipeline is preferred) so that CSS Paged Media rules — `@page`, bleed, crop marks, running headers, page counters — are honoured natively. Do not hand-place elements page by page in a way that cannot reflow. Build a system, then pour content into it.

Recommended stack:

- HTML5 + CSS (CSS Paged Media Module Level 3, CSS Grid, custom properties)
- Paged.js for pagination, crop marks, and bleed
- A single `tokens.css` design-token file imported everywhere
- A component CSS file per recurring module (see §11)
- Self-hosted fonts (no CDN calls in a print pipeline)
- A `build.js` or `build.sh` that renders HTML → PDF at 300 effective DPI

Deliver: one **digital PDF** (RGB, optimized, hyperlinked contents) and one **print PDF** (CMYK-intent, 3 mm bleed, crop marks). See §12.

Work spread by spread. After each spread, run the §13 QA checklist against it before moving on. Do not batch-generate then fix later.

---

## 1. EDITORIAL PHILOSOPHY & VISUAL IDENTITY

Red Chapters is the **considered, literary** end of football media. It is not a matchday programme and not a tabloid. The tone is that of a supporter who writes well: emotionally invested but never breathless, willing to say the uncomfortable thing. The design must carry that voice.

**The identity in one line:** *Brutalist structure, humanist warmth.* Hard grids, enormous type, fearless negative space — but always in service of a story a fan actually wants to read.

Five principles, non-negotiable:

1. **The grid is sacred, the exceptions are deliberate.** Every element sits on the grid. When you break it, break it big and break it once per spread, so the break reads as intent, not error.
2. **Type does the shouting; the layout stays calm.** Drama comes from scale contrast in the typography, not from clutter, gradients, or decorative noise.
3. **One idea per spread.** Each spread has a single dominant element — a headline, an image, or a number. Everything else supports it. No spread competes with itself.
4. **White space is content.** Generous margins and air are the signal of a premium publication. Resist filling every column.
5. **Restraint with the red.** United red is a punctuation mark, not a wall. (See §9.)

---

## 2. THE MODULAR GRID SYSTEM

All measurements in millimetres for print fidelity; convert to CSS with `1mm` units directly under Paged Media.

### Page geometry
- **Trim size:** 210 × 297 mm (A4 portrait). This is the consumer-magazine standard and prints economically.
- **Bleed:** 3 mm on all four edges. Any element touching a trim edge must extend into the full bleed.
- **Crop marks + registration:** on the print PDF only (Paged.js `marks: crop cross`).

### Margins (the safe area)
Asymmetric margins create editorial sophistication and accommodate the spine:
- **Top margin:** 18 mm
- **Bottom margin:** 20 mm (deeper, to seat the running footer and page number)
- **Outside margin:** 16 mm
- **Inside (spine) margin:** 20 mm

The **live/safe area** for critical text and logos is an additional 5 mm inset from the trim on all sides. No headline, caption, or folio crosses into that 5 mm safety zone.

### The 12-column grid
- **Columns:** 12, equal width, spanning the live text area.
- **Gutter:** 5 mm between columns.
- This 12-column base divides cleanly into 2, 3, 4, and 6 — giving you single-column captions, three-column body runs, half-spread images, and quarter-width sidebars from one system.

**Standard column spans:**
| Use | Span |
|---|---|
| Body copy column | 4 columns (3-up text) |
| Feature body | 6 columns (2-up text) |
| Sidebar / stat rail | 3 columns |
| Caption | 2–3 columns |
| Pull quote | 6–8 columns |
| Full-bleed image | 12 columns + bleed |

### The baseline grid
- **Baseline unit:** 4 mm. **Every** line of body text, every block, and every vertical gap snaps to a multiple of this baseline. This is what makes facing pages align across the gutter — the single biggest tell between "designed" and "assembled."
- Body leading = 2 baselines (8 mm... see §3 for the typographic figures; reconcile leading to baseline by setting body line-height to land on the 4 mm grid).

### Spacing tokens (the only spacing values allowed)
Define an 8-point base scale derived from the baseline. Use **nothing else** for margins, padding, or gaps:

```
--space-2xs: 2mm
--space-xs:  4mm   (1 baseline)
--space-sm:  8mm   (2 baselines)
--space-md:  12mm  (3 baselines)
--space-lg:  20mm  (5 baselines)
--space-xl:  32mm  (8 baselines)
--space-2xl: 48mm  (12 baselines)
```

If a gap doesn't appear in this list, it doesn't get used. Consistency of rhythm is produced by constraint.

---

## 3. TYPOGRAPHY HIERARCHY

Two typefaces, no more. A discipline, not a limitation.

- **Display + headlines:** a tight, high-impact grotesque. Use **Söhne**, **Neue Haas Grotesk Display**, or the free **Inter Tight / Archivo** at the heaviest weights. Headlines run **Black/900**, condensed where the family allows.
- **Body + editorial:** a readable text serif for long-form, OR a humanist sans for a cooler register. Recommended: **Source Serif 4** (free, excellent screen + print) for body; keep the grotesque for furniture (labels, folios, stats). The serif body against the grotesque furniture is the move that lifts this above the current all-sans prototype.
- **Numerals / stats:** the grotesque, tabular-lining figures, for league tables and stat blocks so columns align.

### The scale (set on the 4 mm baseline)

| Role | Typeface | Size / Leading | Weight | Tracking | Notes |
|---|---|---|---|---|---|
| **Masthead** | Grotesque | 64–120 pt | 900 | −2% | Optically kerned by hand on the cover only |
| **Hero headline** | Grotesque | 110–160 pt | 900 | −3% | Can break across lines; two-colour split allowed (see §9) |
| **Section / chapter title** | Grotesque | 56–80 pt | 900 | −2% | |
| **Deck (subhead)** | Grotesque | 18–22 pt | 700 | 0 | Sits directly under headline, max 2 lines |
| **Standfirst** | Serif italic | 14 pt / 20 pt | 400 it. | 0 | The intro paragraph; bridges deck to body |
| **Body copy** | Serif | 9.5 pt / 14 pt | 400 | 0 | Leading lands on baseline |
| **Pull quote** | Grotesque | 32–44 pt | 700 | −1% | Often red; see §3.1 |
| **Caption** | Grotesque | 7 pt / 10 pt | 500 | +2% | Italic or uppercase label + roman text |
| **Stat figure (hero)** | Grotesque | 80–200 pt | 900 | −3% | Tabular |
| **Stat label** | Grotesque | 7 pt | 700 | +8% | UPPERCASE |
| **Page number (folio)** | Grotesque | 8 pt | 700 | +4% | |
| **Running header** | Grotesque | 7 pt | 500 | +10% | UPPERCASE, muted |
| **Table text** | Grotesque | 8.5 pt / 12 pt | 500 | 0 | Tabular figures |
| **Kicker / eyebrow** | Grotesque | 8 pt | 700 | +12% | UPPERCASE, red |

### 3.1 Pull quotes
Set large, grotesque, often in red. Hang the opening quotation mark in the margin (optical hang). Keep pull quotes to ≤ 20 words. They should pull a genuinely arresting line, never restate the headline.

### 3.2 Typographic rules
- **Drop caps** optional on feature openers only: 3-line serif initial, baseline-aligned.
- **Hanging punctuation** on all justified or large-set type.
- **No widows or orphans.** Sub-edit the copy to fix; never let a single word hang on the last line.
- **Ligatures + oldstyle figures** in running body serif; **lining tabular** in tables/stats.
- **Em dashes** are part of the house voice and are encouraged in body copy. **Do not use hyphens to join words in display headlines or body prose** — restructure the phrasing instead. (This is a fixed editorial constraint for this title.)

---

## 4. READABILITY & ACCESSIBILITY STANDARDS

Premium means *easy to read*, in print and on a phone.

- **Line length (measure):** 55–70 characters for body copy. At 9.5 pt this lands a 4-column span comfortably. Never let a body column exceed 75 characters.
- **Leading:** body 14 pt on 9.5 pt (≈1.45×) — open enough for sustained reading, snapped to baseline.
- **Paragraph spacing:** indent-based for continuous serif body (first-line indent 4 mm, no space between paragraphs) for a literary feel; OR one-baseline space and no indent for cooler sans sections. Pick one per article and hold it.
- **Tracking:** body at 0. Tighten display (−2 to −3%); open small uppercase labels (+8 to +12%) so they don't crush.
- **Kerning:** rely on the font's kerning tables for body; hand-kern only the cover masthead and any headline at >100 pt.
- **Contrast (WCAG):** body text must meet **4.5:1** minimum against its background; large display **3:1** minimum. Red (#C8102E-family) on white passes for large type but **fails for body** — never set body copy in red on white, or white body on red. Reserve red text for display sizes only.
- **Reversed type (white on dark):** allowed for furniture and decks; for body copy on black, bump weight to 450–500 and size to ≥10 pt to counter optical thinning.
- **Digital tagging:** the PDF must be tagged (logical reading order, alt text on images, bookmarks per chapter) so it is screen-reader navigable and reflow-tolerant.

---

## 5. THE COVER — A COMPLETE REDESIGN

The current cover stacks the masthead, a four-line headline, and a crowd photo in adjacent boxes. It reads as a template. Rebuild it for **shelf impact at thumbnail scale** — the test is whether it grabs you at 2 cm wide in a feed.

### Structure
1. **One commanding focal image, full bleed.** Not a wide crowd shot — a single, emotionally legible subject: a player mid-celebration, a manager's face, the tunnel before kickoff. Crop tight. The eye must land on one thing. Treat the image (see §7) with a graduated darken at top and bottom so type holds.
2. **Masthead, unmistakable.** "RED CHAPTERS" set in the heaviest grotesque, optically kerned, locked top-left or spanning the top edge. It must read as a *brand* — same position, same weight every issue. Consider a thin rule beneath it as a permanent device.
3. **One dominant cover line**, not four. The headline is the hook: e.g. *THE SEASON THAT BROKE US* — but set so the scale does the work. Allow a **two-tone split** (white/red) across the phrase for tension (see §9). Three lines maximum.
4. **A single supporting cover line** (the standfirst tease), small, one or two lines, lower third. Resist the temptation to list every feature on the front.
5. **Issue furniture:** "VOL. 01 · THE SEASON REVIEW" as a quiet eyebrow; the contents teaser ("04 THE COLLAPSE · 08 CASEMIRO…") sits as a slim footer band, not a competing block.
6. **Negative space is the luxury signal.** Let the image and headline breathe. Do not fill the lower third with boxes.

### Hierarchy on the cover (reading order)
Masthead → headline → focal point of image → supporting line → issue furniture. Build the contrast so the eye travels that path without effort.

---

## 6. VISUAL VARIETY — THE PACING OF THE ISSUE

The current issue repeats one structure (headline block + three text columns + stat rail). A magazine should breathe in and out. Choreograph the **rhythm** so no two consecutive spreads feel the same.

Assign each content type a treatment and **alternate density**:

- **Feature opener (full-bleed):** image edge-to-edge, headline reversed out, minimal text. Used for the season collapse, the Carrick run, the rebuild. One per chapter.
- **Two-page text spread:** serif body in 2–3 columns, generous margin, one supporting image or pull quote. For the editor's letter and analysis pieces.
- **Player profile spread:** a tall full-bleed portrait on one page, a vertical stat rail + body on the facing page (the Casemiro/Bruno model — but with a real portrait, not a placeholder block).
- **Comparison panel:** head-to-head stat bars (Bruno vs Henry vs De Bruyne) as a clean horizontal bar chart, not three stacked boxes.
- **Match timeline:** the "10 Defining Moments" — render as a true vertical timeline with a spine line, W/L tokens, and consistent date/result/note rows.
- **Statistics spread ("By The Numbers"):** a grid of large tabular figures, two-season side-by-side, with a single dominant stat enlarged for emphasis.
- **Tactical diagram:** at least one spread should show a pitch graphic — formation, a goal sequence, or the Carrick 3-4-3 shape — drawn as clean SVG, not a photo.
- **Predictions / list spread:** numbered editorial calls as a structured list with strong numerals.
- **Sidebars:** use sparingly to break long text — a 3-column tinted rail with a stat or a quote.

**Rule of alternation:** a dense text spread is always followed by an airy or image-led one. Map the full flatplan before building so you can see the rhythm. A black spread should be followed by a light spread; never two heavy black spreads back to back.

---

## 7. PHOTOGRAPHY DIRECTION

Imagery is currently inconsistent — some pages have placeholder black blocks. Establish a single treatment so every photo looks like it belongs to the same magazine.

### Selection
- **Emotion over action where possible.** A face mid-roar beats a generic action wide.
- **One hero image per spread.** Supporting images are secondary in size by a clear ratio (hero ≥ 2× any secondary).
- Source at **300 dpi at placed size minimum**. A full-bleed A4 image needs ≥ 2480 × 3508 px. Reject anything that pixelates at 100%.

### Cropping
- Crop decisively. Tight crops on faces; respect the rule of thirds for the eye line; leave **lead room** in the direction of movement or gaze.
- Crop to the grid — image edges align to column lines unless full-bleed.

### Treatment (apply consistently)
- **Graduated overlay** for type legibility: a linear black gradient (0% → 60%) from the edge where text sits. Never a flat grey box over the whole image.
- **Duotone** as the house signature for archival/secondary imagery: black → United red, OR black → warm ivory. Apply via CSS `mix-blend-mode` / `filter` or pre-process. Use duotone to unify mixed-quality source photos and to signal "historical."
- **Full-colour** reserved for hero/contemporary images.
- Consistent, subtle **contrast + clarity** baseline so every image shares a tonal feel. Avoid heavy saturation.
- **No drop shadows, no rounded corners, no borders** on photos. Hard edges only — it is a brutalist title.

### Captions
Every editorial image gets a caption: an uppercase grotesque label + roman descriptor, set in the margin or hung off the image's lower edge. Captions are reading content, not afterthoughts.

---

## 8. THE INFOGRAPHIC SYSTEM

Build these as **reusable components** with fixed internal proportions so a stat block on page 4 is identical in construction to one on page 16. Define each once in CSS; instantiate with data.

1. **Player profile card** — portrait + name + position eyebrow + a vertical stack of 3–4 hero stats (fee / apps / goals / year), each as a large tabular figure with a small uppercase label. Consistent label position, consistent figure size.
2. **League table** — tabular-figure rows, POS / CLUB / P / PTS / STATUS. Zebra-free; separate rows with hairline rules. United's row highlighted with a thin red left-edge bar, not a full red fill.
3. **Match timeline row** — [W/L token] · [fixture, bold] · [date, muted] · [one-line note]. A continuous vertical spine connects them. W tokens dark, L tokens red.
4. **Transfer summary** — club eyebrow → player name → fee (large) → goals → one-line verdict. Three across for the "front three" spread, sharing a baseline.
5. **Stat block** — a single dominant figure (tabular, 80–200 pt) with an uppercase label beneath. The atomic unit; everything else is composed from it.
6. **Player rating** — Football-Manager-style: a 0–100 or 0–10 figure with a thin horizontal fill bar, label, and optional category breakdown. Consistent bar height and corner treatment.
7. **Historical comparison** — horizontal bar chart, one row per subject, value as a proportional bar with the figure inline. (Bruno 21 vs Henry 20 vs De Bruyne 20.) United's bar in red, others in graphite.

Every infographic obeys: tabular lining figures, the 4 mm baseline, the spacing tokens, and a single accent (red) used only to mark the United/hero data point.

---

## 9. MANCHESTER UNITED BRANDING — PREMIUM, NOT LOUD

The club identity should be *felt*, not plastered.

- **Colour:** one disciplined red — `#C8102E` (United's Pantone 199-ish red), plus near-black `#0A0A0A`, ivory `#F4F1EA` (warmer than pure white — a print-paper white), and graphite `#2B2B2B` for secondary furniture. That's the palette. Gold `#C8A24B` permitted **only** as a rare ceremonial accent (e.g. the "coming next" / treble teaser), never in the main run.
- **Red is punctuation.** Use it for: one word in a split headline, the kicker/eyebrow, the United row marker, the hero data point, a single pull quote per article. Never as a full-page background block in the main feature run (the current red header bands should become thin rules or disappear).
- **The crest:** use sparingly. Prefer a small **monochrome (ivory or graphite) crest** as a quiet device on the contents and back cover, not a full-colour crest on every spread. Let typography and the red carry the identity.
- **Permanent devices:** the masthead, a hairline rule under running headers, and the folio style — these recur identically every issue and *are* the brand. Consistency is the premium signal, not volume of club marks.

---

## 10. CONSISTENT ALIGNMENT, SPACING & RHYTHM

This section is the difference between "handcrafted" and "assembled." Enforce mechanically:

- **Everything snaps to the 12-column grid horizontally and the 4 mm baseline vertically.** No off-grid placement, ever.
- **Optical alignment** over mathematical where they conflict: hang punctuation and bullets; align by the visual edge of letterforms in large display.
- **Vertical rhythm:** the gap between any two stacked elements is one of the spacing tokens — never an arbitrary value. The most common vertical gap should repeat across the issue so the reader's eye learns the rhythm.
- **Cross-gutter alignment:** facing pages share the baseline grid; horizontal elements (rules, image tops, headline baselines) should align across the spread where possible.
- **Edge discipline:** captions align to image edges; folios sit at a fixed distance from trim on every page; running headers occupy an identical band every page.
- **One anchor per spread:** identify the dominant element first, place it on the grid, then hang everything else off it.

---

## 11. THE COMPONENT LIBRARY

Build these as named, reusable CSS components. Each is defined once and reused — that is what guarantees consistency. Document each with its grid span, spacing, and type roles.

- **`masthead`** — cover wordmark lockup + rule.
- **`chapter-opener`** — kicker + giant chapter title + deck + opening image treatment. The recurring "feature opener" frame.
- **`pull-quote`** — hanging-punctuation large quote, red variant + dark variant.
- **`stat-block`** — figure + label (the atomic infographic unit).
- **`stat-rail`** — vertical stack of stat-blocks for profile pages.
- **`player-card`** — portrait + profile stat stack.
- **`league-table`** — tabular rows + United highlight.
- **`timeline`** — spine + result tokens + rows.
- **`comparison-bar`** — horizontal proportional bars.
- **`rating-bar`** — FM-style rating with fill.
- **`sidebar`** — tinted 3-column rail for breakouts.
- **`caption`** — label + descriptor.
- **`section-divider`** — full-bleed or rule-based break between chapters.
- **`running-header`** — top band: issue · chapter (left), section name (right).
- **`page-footer`** — folio + "RED CHAPTERS" + "VOL. 01 · THE SEASON REVIEW", fixed position via `@page` margin boxes.
- **`contents`** — the front contents, set as a typographic index with chapter numbers as large numerals.
- **`back-cover`** — next-issue teaser, restrained, gold-accented.

Each component must accept content without breaking its proportions. Test each at min and max content length.

---

## 12. PRINT PRODUCTION & DIGITAL EXPORT

### Print PDF
- **Bleed:** 3 mm all edges; all full-bleed elements extend into it.
- **Crop + registration marks:** on (Paged.js `marks: crop cross`).
- **Colour:** prepare for **CMYK** output. Convert red, black, ivory to CMYK build values; avoid rich-black for text (use 100% K for body text, rich black only for large solids). Flag the red's CMYK build (≈ C0 M100 Y90 K10) so it prints consistently.
- **Resolution:** all placed raster images ≥ 300 dpi at final size. Vector (SVG) for all infographics, rules, and the masthead so they stay crisp.
- **Fonts:** fully embedded or outlined.
- **Total ink coverage:** keep solids ≤ 300% TAC to avoid offset issues.

### Digital PDF
- **RGB**, sRGB colour profile.
- **Hyperlinked contents** + PDF bookmarks per chapter.
- **Tagged** (reading order, alt text, see §4).
- **Optimised** file size (downsample images to ~150 dpi for screen build; keep a separate hi-res print build).
- Spreads exported as **single pages** for digital reading; print build as imposition-ready singles with bleed.

Produce **two builds from one source**: a print profile and a screen profile, switched by a build flag.

---

## 13. PRE-PUBLICATION QA CHECKLIST

Run this against **every spread** before sign-off. A spread fails if any item fails.

**Typography**
- [ ] Type scale used correctly; no off-scale sizes
- [ ] Body measure 55–70 characters
- [ ] No widows or orphans
- [ ] Hanging punctuation on display + quotes
- [ ] No hyphenated joins in headlines or prose; em dashes used per house style
- [ ] Tabular figures in all tables and stat blocks

**Grid, spacing, alignment**
- [ ] Every element on the 12-column grid
- [ ] Every vertical gap is a spacing token
- [ ] Baselines align across the gutter
- [ ] Folios, running headers, captions in fixed positions

**Hierarchy & storytelling**
- [ ] One dominant element per spread; clear reading order
- [ ] This spread differs in structure from the one before it
- [ ] The red appears as punctuation, not a block

**Image quality**
- [ ] Hero image ≥ 300 dpi at placed size
- [ ] Consistent treatment (gradient/duotone) applied
- [ ] Hard edges, no shadows/rounding/borders
- [ ] Every image captioned

**Readability & accessibility**
- [ ] Body contrast ≥ 4.5:1; no red body copy
- [ ] Reversed body ≥ 10 pt, weight bumped
- [ ] (Digital) tagged, alt text, bookmarks present

**Production**
- [ ] Bleed correct on full-bleed elements
- [ ] Fonts embedded; vectors crisp
- [ ] CMYK build values flagged (print) / sRGB (digital)

---

## 14. THE MANDATE

Do not think like a page generator. Think like an editorial team shipping an issue. Before each spread, ask the three questions a real art director asks: *Is it easy to read? Does it tell the story? Does it hit?* If a decorative flourish can't answer at least one of those with yes, cut it. The finished magazine should feel handcrafted, calm, confident, and premium — something a United supporter would pick up off a shelf, turn over in their hands, and believe was made by professionals who love the club and respect the reader.

Build it spread by spread. QA each one. Then ship.
