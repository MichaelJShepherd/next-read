/**
 * Production smoke test.
 * Serves the minified production bundle from dist/frontend/browser,
 * loads it in headless Chromium, and asserts the app root renders.
 *
 * Catches prod-only failures (env substitution, bundle errors, CSP) that
 * the dev e2e suite cannot detect.
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DIST_DIR = path.join(__dirname, '..', 'dist', 'frontend', 'browser');
const PORT = 4299;

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.ico': 'image/x-icon',
        '.svg': 'image/svg+xml',
      };
      res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(PORT, () => resolve(server));
    server.on('error', reject);
  });
}

async function run() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`ERROR: dist not found at ${DIST_DIR}. Run "npm run build" first.`);
    process.exit(1);
  }

  const server = await startServer();
  let browser;

  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0', timeout: 30000 });

    const appRoot = await page.$('app-root');
    if (!appRoot) {
      throw new Error('<app-root> element not found — Angular app failed to bootstrap');
    }

    const innerHtml = await page.evaluate((el) => el.innerHTML, appRoot);
    if (!innerHtml || innerHtml.trim() === '') {
      throw new Error('<app-root> is empty — Angular app rendered nothing');
    }

    if (errors.length > 0) {
      console.warn('Console errors detected (non-fatal):\n' + errors.join('\n'));
    }

    console.log('Smoke test passed: <app-root> rendered successfully.');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('Smoke test FAILED:', err.message);
  process.exit(1);
});
