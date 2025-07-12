// lib/createBirthHtmlOnSubmit.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function createBirthHtml(userData) {
  const { id, name } = userData;
  const filename = `birth_${id}`;

  // 📁 HTML wird in public/view/ gespeichert (damit Vercel es ausliefert)
  const htmlPath = path.join(__dirname, '..', 'public', 'view', `${filename}.html`);

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="de">
    <head>
      <meta charset="utf-8" />
      <title>Dein Horoskop – ${name}</title>
      <style>
        body {
          font-family: sans-serif;
          padding: 2rem;
          max-width: 600px;
          margin: auto;
          background-color: #fefefe;
          color: #333;
        }
        h1 {
          color: #7c3aed;
        }
        a {
          display: inline-block;
          margin-top: 1rem;
          text-decoration: none;
          color: white;
          background: #7c3aed;
          padding: 0.5rem 1rem;
          border-radius: 8px

