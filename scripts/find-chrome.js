// Resolve the system Chromium that ships with the environment so Playwright
// never tries to download its own (network is locked down in this sandbox).
const fs = require('fs');
const path = require('path');

function findChrome() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  const candidates = [];
  try {
    for (const dir of fs.readdirSync(base)) {
      if (/^chromium-\d+$/.test(dir)) {
        candidates.push(path.join(base, dir, 'chrome-linux', 'chrome'));
      }
    }
  } catch (e) {
    /* fall through to explicit candidates */
  }
  candidates.push('/opt/pw-browsers/chromium-1194/chrome-linux/chrome');
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null; // let Playwright try its own resolution
}

module.exports = { findChrome };
