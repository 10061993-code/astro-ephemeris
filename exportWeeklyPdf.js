const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const users = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "users.json"), "utf8"));

function getUpcomingSunday(date) {
  const sunday = new Date(date);
  sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7));
  return sunday.toISOString().split("T")[0];
}

async function exportPdf(user) {
  const name = user.name.toLowerCase();
  const date = getUpcomingSunday(new Date());
  const htmlPath = path.join(__dirname, "exports_html", `${name}_${date}.html`);
  const pdfPath = path.join(__dirname, "exports_pdf", `${name}_${date}.pdf`);

  if (!fs.existsSync(htmlPath)) {
    console.log(`⚠️ HTML-Datei nicht gefunden für ${user.name}`);
    return;
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("file://" + htmlPath, { waitUntil: "networkidle0" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "1cm", bottom: "1cm", left: "1cm", right: "1cm" }
  });
  await browser.close();
  console.log(`✅ PDF exportiert für ${user.name}: ${pdfPath}`);
}

async function exportAll() {
  for (const user of users) {
    await exportPdf(user);
  }
}

exportAll();

