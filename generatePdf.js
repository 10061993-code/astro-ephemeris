// generatePdf.js
import puppeteer from 'puppeteer';

export async function generatePdfFromText(text, outputFilename) {
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          pre { white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head>
      <body>
        <pre>${text}</pre>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outputFilename, format: 'A4', printBackground: true });
  await browser.close();

  return outputFilename;
}

