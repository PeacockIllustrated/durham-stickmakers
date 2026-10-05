// Renders the A5 flyer to a print PDF (with 3 mm bleed) and trimmed PNG previews.
// Usage: node docs/flyers/render.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = resolve(__dirname, 'stick-making-course-a5.html');
const out = (f) => resolve(__dirname, f);

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 3 });
await page.goto(`file://${html}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

await page.pdf({ path: out('stick-making-course-a5.pdf'), preferCSSPageSize: true, printBackground: true });

// Previews cropped to the A5 trim line (bleed removed)
await page.emulateMedia({ media: 'print' });
await page.addStyleTag({ content: 'html,body{background:#fff}.page{margin:0!important;box-shadow:none!important}' });
const pages = await page.$$('.page');
const names = ['front', 'back'];
const mm = 96 / 25.4;
for (let i = 0; i < pages.length; i++) {
  const b = await pages[i].boundingBox();
  await page.screenshot({
    fullPage: true,
    path: out(`preview-${names[i]}.png`),
    clip: { x: b.x + 3 * mm, y: b.y + 3 * mm, width: 148 * mm, height: 210 * mm },
  });
}
await browser.close();
console.log('done');
