import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, 'owner-guide.html');
const pdfPath = resolve(__dirname, 'Durham-Stick-Makers-Owner-Guide.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`, {
  waitUntil: 'networkidle',
});

// Wait for Google Fonts to load
await page.waitForTimeout(2000);

await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
  preferCSSPageSize: true,
});

await browser.close();
console.log(`PDF generated: ${pdfPath}`);
