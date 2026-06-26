#!/usr/bin/env node
/* ============================================================
   RED CHAPTERS — build pipeline
   Renders src/magazine.html to PDF through Paged.js running
   inside the environment's Chromium (driven by Playwright).

   Two profiles from one source (spec §12):
     node build.js print     -> dist/red-chapters-vol01-print.pdf
                                 (3mm bleed + crop/registration marks)
     node build.js digital   -> dist/red-chapters-vol01-digital.pdf
                                 (A4 trim, screen sRGB, bookmarks)
     node build.js both      -> both
   Optional: --png[=N]  also rasterises page N (or all) to build/ for QA.
   ============================================================ */
const { chromium } = require('playwright-core');
const { findChrome } = require('./scripts/find-chrome.js');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Paged.js re-fetches linked stylesheets, so we must serve over HTTP (file://
// blocks fetch in headless Chromium). Minimal static server rooted at the repo.
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.json': 'application/json',
};
function startServer(root) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      const filePath = path.join(root, urlPath);
      if (!filePath.startsWith(root)) { res.statusCode = 403; return res.end(); }
      fs.readFile(filePath, (err, data) => {
        if (err) { res.statusCode = 404; return res.end('404'); }
        res.setHeader('Content-Type', MIME[path.extname(filePath)] || 'application/octet-stream');
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const ROOT = __dirname;
const SRC = path.resolve(ROOT, 'src/magazine.html');
const DIST = path.resolve(ROOT, 'dist');
const BUILD = path.resolve(ROOT, 'build');
fs.mkdirSync(DIST, { recursive: true });
fs.mkdirSync(BUILD, { recursive: true });

const PROFILES = {
  print: {
    file: 'red-chapters-vol01-print.pdf',
    // Enlarge the sheet to trim + 3mm bleed all round and centre the 210x297
    // page with a 3mm margin; full-bleed art (--bleed:3mm) fills that margin to
    // the sheet edge. marks: crop cross adds crop + registration marks.
    pageCss: '@page { size: 216mm 303mm; margin: 3mm; bleed: 3mm; marks: crop cross; }',
  },
  digital: {
    file: 'red-chapters-vol01-digital.pdf',
    pageCss: '',
  },
};

async function render(profileName, opts, server) {
  const profile = PROFILES[profileName];
  const exe = findChrome();
  const browser = await chromium.launch({
    executablePath: exe,
    args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  // load over HTTP WITHOUT auto-running paged.js so we can set the profile first
  const port = server.address().port;
  await page.goto(`http://127.0.0.1:${port}/src/magazine.html?manual=1`, { waitUntil: 'networkidle' });

  await page.evaluate(({ profileName, pageCss }) => {
    document.documentElement.setAttribute('data-profile', profileName);
    if (pageCss) {
      const s = document.createElement('style');
      s.id = 'profile-page-css';
      s.textContent = pageCss;
      document.head.appendChild(s);
    }
  }, { profileName, pageCss: profile.pageCss });

  // run Paged.js and wait for pagination to finish
  await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const previewer = new Paged.Previewer();
    const flow = await previewer.preview(undefined, undefined, undefined);
    window.__pagedFlow = { total: flow.total };
  });
  await page.waitForFunction(() => window.__pagedFlow && window.__pagedFlow.total > 0, { timeout: 60000 });

  const total = await page.evaluate(() => document.querySelectorAll('.pagedjs_page').length);

  await page.pdf({
    path: path.join(DIST, profile.file),
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
  });

  if (opts.png !== undefined) {
    await rasterise(page, opts.png);
  }

  await browser.close();
  if (errors.length) {
    console.log(`  ⚠ ${errors.length} console/page errors (first 3):`);
    errors.slice(0, 3).forEach(e => console.log('    ', e.slice(0, 200)));
  }
  console.log(`  ✓ ${profileName}: ${total} pages -> dist/${profile.file}`);
  return total;
}

// Rasterise individual paged.js pages to PNG for visual QA.
async function rasterise(page, which) {
  const sel = '.pagedjs_page';
  const count = await page.evaluate(s => document.querySelectorAll(s).length, sel);
  const targets = (which === 'all' || which === true)
    ? Array.from({ length: count }, (_, i) => i + 1)
    : String(which).split(',').map(n => parseInt(n, 10)).filter(Boolean);
  for (const n of targets) {
    if (n < 1 || n > count) continue;
    const el = page.locator(sel).nth(n - 1);
    await el.scrollIntoViewIfNeeded();
    await el.screenshot({ path: path.join(BUILD, `page-${String(n).padStart(2, '0')}.png`) });
  }
  console.log(`  ✓ rasterised ${targets.length} page(s) to build/`);
}

(async () => {
  const arg = process.argv[2] || 'both';
  const pngArg = process.argv.find(a => a.startsWith('--png'));
  const opts = {};
  if (pngArg) {
    const v = pngArg.includes('=') ? pngArg.split('=')[1] : 'all';
    opts.png = v;
  }
  const which = arg === 'both' ? ['digital', 'print'] : [arg];
  if (!which.every(p => PROFILES[p])) {
    console.error('usage: node build.js [print|digital|both] [--png[=1,2,..|all]]');
    process.exit(1);
  }
  console.log('RED CHAPTERS — building', which.join(' + '));
  const server = await startServer(ROOT);
  try {
    for (const p of which) await render(p, opts, server);
  } finally {
    server.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
