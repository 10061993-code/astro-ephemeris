const fs = require("fs");
const csv = require("csv-parser");

fs.createReadStream("users.csv")
  .pipe(csv())
  .on("data", (row) => {
    console.log("📦 Gelesene Daten:", row);
  })
  .on("end", () => {
    console.log("✅ CSV erfolgreich gelesen.");
  });

