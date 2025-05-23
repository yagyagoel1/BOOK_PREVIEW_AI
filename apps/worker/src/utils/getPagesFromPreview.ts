import puppeteer from 'puppeteer';

async function downloadPreviewPages(previewUrl: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });

  // Inject GBPPD script
  const gbppdScript = await page.evaluate(() => {
    const script = document.createElement('script');
    script.src = 'https://raw.githubusercontent.com/mcdxn/google-books-preview-pages-downloader/master/gbppd-mini.js';
    document.head.appendChild(script);
    return new Promise((resolve) => {
      script.onload = () => resolve(true);
    });
  });

  if (gbppdScript) {
    await page.evaluate(() => gbppd.start());
    await page.waitForTimeout(5000); // Wait for pages to load
    await page.evaluate(() => gbppd.finish());
  }

  await browser.close();
}

// Usage
const previewUrl = 'https://books.google.com/books?id=your_book_id';
await downloadPreviewPages(previewUrl);
