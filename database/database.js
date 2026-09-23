const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "waste.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("SQLite database connected successfully.");
  }
});

db.serialize(() => {

  // ==========================================
  // RESIDENT REPORTS
  // ==========================================
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      suburb TEXT NOT NULL,
      issue_type TEXT NOT NULL,
      description TEXT NOT NULL,
      report_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open'
    )
  `);


  // ==========================================
  // COLLECTION SCHEDULES
  // ==========================================
  db.run(`
    CREATE TABLE IF NOT EXISTS collection_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      suburb TEXT NOT NULL,
      bin_type TEXT NOT NULL,
      collection_date TEXT NOT NULL,
      collection_day TEXT NOT NULL
    )
  `);


  // ==========================================
  // RECYCLING GUIDE
  // ==========================================
  db.run(`
    CREATE TABLE IF NOT EXISTS recycling_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      disposal_instruction TEXT NOT NULL
    )
  `);


  // ==========================================
  // WASTE LIBRARY
  // ==========================================
  db.run(`
    CREATE TABLE IF NOT EXISTS library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      bin_type TEXT NOT NULL,
      instruction TEXT NOT NULL
    )
  `);


  // ==========================================
  // SAMPLE COLLECTION SCHEDULES
  // ==========================================
  db.get(
    "SELECT COUNT(*) AS count FROM collection_schedules",
    (err, row) => {

      if (!err && row.count === 0) {

        const stmt = db.prepare(`
          INSERT INTO collection_schedules
          (suburb, bin_type, collection_date, collection_day)
          VALUES (?, ?, ?, ?)
        `);

        const schedules = [
          ["Canberra City", "General Waste", "2026-09-10", "Thursday"],
          ["Canberra City", "Recycling", "2026-09-17", "Thursday"],

          ["Belconnen", "General Waste", "2026-09-11", "Friday"],
          ["Belconnen", "Green Waste", "2026-09-18", "Friday"],

          ["Gungahlin", "General Waste", "2026-09-12", "Saturday"],
          ["Gungahlin", "Recycling", "2026-09-19", "Saturday"],

          ["Woden", "General Waste", "2026-09-14", "Monday"],
          ["Woden", "Recycling", "2026-09-21", "Monday"],

          ["Tuggeranong", "General Waste", "2026-09-15", "Tuesday"],
          ["Tuggeranong", "Green Waste", "2026-09-22", "Tuesday"]
        ];

        schedules.forEach(schedule => stmt.run(...schedule));

        stmt.finalize();
      }
    }
  );


  // ==========================================
  // SAMPLE RECYCLING GUIDE
  // ==========================================
  db.get(
    "SELECT COUNT(*) AS count FROM recycling_items",
    (err, row) => {

      if (!err && row.count === 0) {

        const stmt = db.prepare(`
          INSERT INTO recycling_items
          (item_name, category, disposal_instruction)
          VALUES (?, ?, ?)
        `);

        const items = [

          [
            "Plastic bottle",
            "Recycling",
            "Empty and rinse the bottle, then place it in the recycling bin."
          ],

          [
            "Glass bottle",
            "Recycling",
            "Remove lids if possible and place the clean glass bottle in the recycling bin."
          ],

          [
            "Pizza box",
            "Paper/Cardboard",
            "Recycle clean cardboard. Put heavily greasy sections in general waste."
          ],

          [
            "Battery",
            "E-waste",
            "Do not place batteries in household bins. Take batteries to an approved battery recycling point."
          ],

          [
            "Laptop",
            "E-waste",
            "Take the device to an approved e-waste collection or recycling facility."
          ],

          [
            "Food scraps",
            "General/Organic Waste",
            "Use your household organic or food waste service where available, otherwise general waste."
          ],

          [
            "Garden clippings",
            "Green Waste",
            "Place grass, leaves and small garden clippings in the green waste bin."
          ],

          [
            "Soft plastic",
            "General Waste",
            "Do not place soft plastic in mixed recycling unless a specialist collection service accepts it."
          ],

          [
            "Newspaper",
            "Paper/Cardboard",
            "Place clean and dry newspapers in the recycling bin."
          ],

          [
            "Broken ceramic",
            "General Waste",
            "Wrap sharp pieces safely and place in general waste. Do not put ceramics in glass recycling."
          ]

        ];

        items.forEach(item => stmt.run(...item));

        stmt.finalize();
      }
    }
  );


  // ==========================================
  // WASTE LIBRARY ITEMS
  // ==========================================
  db.get(
    "SELECT COUNT(*) AS count FROM library",
    (err, row) => {

      if (!err && row.count === 0) {

        const stmt = db.prepare(`
          INSERT INTO library
          (item_name, category, bin_type, instruction)
          VALUES (?, ?, ?, ?)
        `);

        const libraryItems = [

          [
            "Plastic Bottle",
            "Plastic",
            "Recycling Bin",
            "Empty and rinse the bottle before placing it in the recycling bin."
          ],

          [
            "Glass Bottle",
            "Glass",
            "Recycling Bin",
            "Empty and rinse the bottle before recycling."
          ],

          [
            "Cardboard",
            "Paper & Cardboard",
            "Recycling Bin",
            "Flatten clean cardboard before placing it in the recycling bin."
          ],

          [
            "Newspaper",
            "Paper & Cardboard",
            "Recycling Bin",
            "Keep newspapers clean and dry before recycling."
          ],

          [
            "Battery",
            "E-Waste",
            "Special Drop-off",
            "Never place batteries in household bins. Take them to an approved battery recycling point."
          ],

          [
            "Laptop",
            "E-Waste",
            "E-Waste Drop-off",
            "Take old laptops to an approved electronic waste recycling facility."
          ],

          [
            "Mobile Phone",
            "E-Waste",
            "E-Waste Drop-off",
            "Take old mobile phones to an approved electronic waste recycling location."
          ],

          [
            "Food Scraps",
            "Organic Waste",
            "Organic / General Waste",
            "Use an organic food waste service where available."
          ],

          [
            "Garden Clippings",
            "Green Waste",
            "Green Waste Bin",
            "Place grass, leaves and suitable garden clippings in the green waste bin."
          ],

          [
            "Broken Ceramic",
            "General Waste",
            "General Waste Bin",
            "Wrap sharp ceramic pieces safely before placing them in general waste."
          ],

          [
            "Soft Plastic",
            "Plastic",
            "General Waste",
            "Soft plastics should not be placed in mixed recycling unless a specialist service accepts them."
          ],

          [
            "Metal Can",
            "Metal",
            "Recycling Bin",
            "Empty and rinse cans before placing them in the recycling bin."
          ]

        ];

        libraryItems.forEach(item => stmt.run(...item));

        stmt.finalize();
      }
    }
  );


  // ==========================================
  // SAMPLE RESIDENT REPORTS
  // ==========================================
  db.get(
    "SELECT COUNT(*) AS count FROM reports",
    (err, row) => {

      if (!err && row.count === 0) {

        const stmt = db.prepare(`
          INSERT INTO reports
          (
            name,
            email,
            suburb,
            issue_type,
            description,
            report_date,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const reports = [

          [
            "Alex Brown",
            "alex@example.com",
            "Belconnen",
            "Missed Collection",
            "General waste was not collected.",
            "2026-09-06",
            "Open"
          ],

          [
            "Mia Taylor",
            "mia@example.com",
            "Gungahlin",
            "Overflowing Bin",
            "Public bin near local shops is overflowing.",
            "2026-09-07",
            "In Progress"
          ],

          [
            "Noah Wilson",
            "noah@example.com",
            "Woden",
            "Damaged Bin",
            "Recycling bin lid is broken.",
            "2026-09-08",
            "Resolved"
          ]

        ];

        reports.forEach(report => stmt.run(...report));

        stmt.finalize();
      }
    }
  );

});

module.exports = db;