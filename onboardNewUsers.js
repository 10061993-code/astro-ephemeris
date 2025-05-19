require("dotenv").config();
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 👉 helper to read current emails from sent.json
function getExistingEmails() {
  const sentPath = path.join(__dirname, "data", "sent.json");
  if (!fs.existsSync(sentPath)) return [];
  const sent = JSON.parse(fs.readFileSync(sentPath, "utf8"));
  return Object.keys(sent);
}

function getNewUsers(allUsers, knownEmails) {
  return allUsers.filter(u => !knownEmails.includes(u.email));
}

function readUsersJson() {
  const pathToJson = path.join(__dirname, "data", "users.json");
  return JSON.parse(fs.readFileSync(pathToJson, "utf8"));
}

// 👉 main onboarding flow
function onboardNewUsers() {
  console.log("🚀 Starte Onboarding für neue Nutzer:innen...");

  // Schritt 1: Nutzer aktualisieren
  execSync("node parseUsers.js", { stdio: "inherit" });

  // Schritt 2: neue Nutzer identifizieren
  const allUsers = readUsersJson();
  const knownEmails = getExistingEmails();
  const newUsers = getNewUsers(allUsers, knownEmails);

  if (newUsers.length === 0) {
    console.log("ℹ️ Keine neuen Nutzer:innen gefunden.");
    return;
  }

  console.log(`👥 ${newUsers.length} neue Nutzer:innen gefunden.`);

  // Schritt 3: Geburtshoroskope erzeugen
  execSync("node generateHoroscope.js", { stdio: "inherit" });

  // Schritt 4: Horoskop-HTML per Mail senden
  execSync("node sendHoroscope.js", { stdio: "inherit" });

  // Schritt 5: Dashboard aktualisieren
  execSync("node generateDashboard.js", { stdio: "inherit" });

  console.log("✅ Onboarding abgeschlossen.");
}

onboardNewUsers();

