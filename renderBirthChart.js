// renderBirthChart.js
import fs from 'fs/promises';
import path from 'path';

export async function renderBirthChartHTML({ user, text, date }) {
  const html = `
  <!DOCTYPE html>
  <html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dein Geburtshoroskop – ${user.name}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0; padding: 2rem;
        background: #fff;
        color: #111;
        line-height: 1.6;
        max-width: 600px;
        margin: auto;
      }
      h1 {
        font-size: 1.8rem;
        margin-bottom: 1rem;
      }
      .date {
        font-size: 0.9rem;
        color: #777;
        margin-bottom: 2rem;
      }
      .content {
        white-space: pre-wrap;
      }
      footer {
        margin-top: 3rem;
        font-size: 0.85rem;
        color: #aaa;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <h1>Geburtshoroskop für ${user.name}</h1>
    <div class="date">Erstellt am ${date}</div>
    <div class="content">${text}</div>
    <footer>&copy; ${new Date().getFullYear()} LUZID</footer>
  </body>
  </html>
  `;

  const safeName = user.name.toLowerCase().replace(/[^a-z0-9]/gi, '_');
  const filePath = path.join('birthcharts', `${safeName}_birth.html`);
  await fs.writeFile(filePath, html, 'utf-8');
  console.log(`✅ HTML gespeichert unter: ${filePath}`);
}

