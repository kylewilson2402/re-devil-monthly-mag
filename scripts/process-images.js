/* ============================================================
   RED CHAPTERS — image preprocessing (spec §7)
   Establishes ONE tonal treatment so every photo belongs to the
   same magazine, plus duotone variants for archival/secondary use.
   Source frames are modest resolution; we upscale with a quality
   kernel + light sharpen and bake a consistent contrast/saturation
   baseline. (Honest note: true 300dpi A4 needs ~2480px wide; some
   sources fall short and are flagged in the build report.)
   ============================================================ */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const RAW = path.resolve(__dirname, '../assets/img/raw');
const OUT = path.resolve(__dirname, '../assets/img/processed');
fs.mkdirSync(OUT, { recursive: true });

// duotone endpoints: [shadow, highlight] as RGB. A proper gradient map:
// out_channel = a*L + b, with b = shadow, a = (highlight - shadow)/255.
const DUO_RED   = { shadow: [20, 3, 6],   highlight: [226, 58, 79] };   // black -> United red
const DUO_IVORY = { shadow: [12, 12, 14], highlight: [244, 241, 234] }; // black -> ivory

// long-edge target per asset (px). Upscaling allowed for placement.
const JOBS = [
  { src: 'cover-tunnel.png',      out: 'cover-tunnel',      long: 2600, treat: 'colour' },
  { src: 'crowd-banners.png',     out: 'crowd-banners',     long: 2600, treat: 'colour' },
  { src: 'casemiro-walkout.png',  out: 'casemiro-walkout',  long: 2400, treat: 'colour' },
  { src: 'casemiro-walkout-b.png',out: 'casemiro-walkout-b',long: 2000, treat: 'colour' },
  { src: 'carrick-training.png',  out: 'carrick-training',  long: 2600, treat: 'colour' },
  { src: 'bruno-shirt.png',       out: 'bruno-shirt',       long: 2400, treat: 'colour' },
  { src: 'team-brighton.png',     out: 'team-brighton',     long: 2600, treat: 'colour' },
  { src: 'celebration-a.png',     out: 'celebration-a',     long: 2000, treat: 'colour' },
  { src: 'celebration-b.png',     out: 'celebration-b',     long: 2000, treat: 'colour' },
];

// shared tonal baseline: gentle contrast, restrained saturation
function tone(img) {
  return img
    .modulate({ saturation: 0.90, brightness: 1.0 })
    .linear(1.06, -8)          // a*x + b : lift contrast a touch, deepen shadows
    .gamma(1.02)
    .sharpen({ sigma: 0.7 });
}

// gradient-map duotone (archival signature). shadow->highlight across luminance.
async function duotone(srcPath, outPath, long, duo) {
  const meta = await sharp(srcPath).metadata();
  const isPortrait = (meta.height || 1) >= (meta.width || 1);
  const resize = isPortrait ? { height: long } : { width: long };
  const a = duo.highlight.map((h, i) => (h - duo.shadow[i]) / 255);
  const b = duo.shadow.slice();
  await sharp(srcPath)
    .resize({ ...resize, withoutEnlargement: false, kernel: 'lanczos3' })
    .recomb([                  // desaturate but keep 3 bands (grayscale() drops to 1)
      [0.2126, 0.7152, 0.0722],
      [0.2126, 0.7152, 0.0722],
      [0.2126, 0.7152, 0.0722],
    ])
    .normalize()
    .linear(a, b)              // per-channel gradient map: out = a*L + b
    .sharpen({ sigma: 0.6 })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(outPath);
}

(async () => {
  const report = [];
  for (const job of JOBS) {
    const srcPath = path.join(RAW, job.src);
    if (!fs.existsSync(srcPath)) { console.warn('missing', job.src); continue; }
    const meta = await sharp(srcPath).metadata();
    const isPortrait = meta.height >= meta.width;
    const resize = isPortrait ? { height: job.long } : { width: job.long };

    const outColour = path.join(OUT, job.out + '.jpg');
    await tone(sharp(srcPath).resize({ ...resize, withoutEnlargement: false, kernel: 'lanczos3' }))
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(outColour);

    // duotone variants
    await duotone(srcPath, path.join(OUT, job.out + '-duo.jpg'), Math.min(job.long, 1800), DUO_RED);
    await duotone(srcPath, path.join(OUT, job.out + '-duo-ivory.jpg'), Math.min(job.long, 1800), DUO_IVORY);

    const o = await sharp(outColour).metadata();
    // effective dpi if this image fills a full-bleed A4 long edge (303mm = 11.93in)
    const effDpi = Math.round((isPortrait ? o.height : o.width) / 11.93);
    report.push({ asset: job.out, src: `${meta.width}x${meta.height}`,
      out: `${o.width}x${o.height}`, fullbleedDpi: effDpi });
  }
  console.table(report);
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(report, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
