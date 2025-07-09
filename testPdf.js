import { generatePdfFromText } from './generatePdf.js';
import path from 'path';

(async () => {
  try {
    const sampleText = "Hallo, das ist ein Test-PDF von LUZID!";
    const pdfPath = path.resolve('horoscopes', `test_${Date.now()}.pdf`);
    await generatePdfFromText(sampleText, pdfPath);
    console.log("PDF erfolgreich erzeugt unter:", pdfPath);
  } catch (error) {
    console.error("Fehler bei der PDF-Erzeugung:", error);
  }
})();

