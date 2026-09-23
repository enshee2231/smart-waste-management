const express = require("express");
const path = require("path");

const db = require("./database/database");

const app = express();

const PORT = process.env.PORT || 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);


// ==========================================
// VIEW HELPER
// ==========================================

function sendView(res, file) {
  res.sendFile(
    path.join(__dirname, "views", file)
  );
}


// ==========================================
// WEBSITE PAGES
// ==========================================

app.get("/", (req, res) =>
  sendView(res, "index.html")
);

app.get("/schedule", (req, res) =>
  sendView(res, "schedule.html")
);

app.get("/recycling", (req, res) =>
  sendView(res, "recycling.html")
);

app.get("/library", (req, res) =>
  sendView(res, "library.html")
);

app.get("/report", (req, res) =>
  sendView(res, "report.html")
);

app.get("/track", (req, res) =>
  sendView(res, "track.html")
);

app.get("/routes", (req, res) =>
  sendView(res, "routes.html")
);

app.get("/admin", (req, res) =>
  sendView(res, "admin.html")
);


// ==========================================
// COLLECTION SCHEDULE API
// ==========================================

app.get("/api/schedules", (req, res) => {

  const suburb = req.query.suburb;

  let sql =
    "SELECT * FROM collection_schedules";

  const params = [];


  if (suburb) {

    sql +=
      " WHERE LOWER(suburb) = LOWER(?)";

    params.push(suburb);
  }


  sql += " ORDER BY collection_date ASC";


  db.all(sql, params, (err, rows) => {

    if (err) {

      console.error(err);

      return res.status(500).json({
        error: "Unable to load schedules."
      });
    }

    res.json(rows);
  });
});


// ==========================================
// CREATE SCHEDULE
// ==========================================

app.post("/api/schedules", (req, res) => {

  const {
    suburb,
    bin_type,
    collection_date,
    collection_day
  } = req.body;


  if (
    !suburb ||
    !bin_type ||
    !collection_date ||
    !collection_day
  ) {

    return res.status(400).json({
      error: "All schedule fields are required."
    });
  }


  db.run(
    `
    INSERT INTO collection_schedules
    (
      suburb,
      bin_type,
      collection_date,
      collection_day
    )
    VALUES (?, ?, ?, ?)
    `,
    [
      suburb.trim(),
      bin_type.trim(),
      collection_date,
      collection_day.trim()
    ],
    function (err) {

      if (err) {

        console.error(err);

        return res.status(500).json({
          error: "Unable to create schedule."
        });
      }

      res.status(201).json({
        id: this.lastID,
        message: "Schedule created."
      });
    }
  );
});


// ==========================================
// UPDATE SCHEDULE
// ==========================================

app.put("/api/schedules/:id", (req, res) => {

  const {
    suburb,
    bin_type,
    collection_date,
    collection_day
  } = req.body;


  if (
    !suburb ||
    !bin_type ||
    !collection_date ||
    !collection_day
  ) {

    return res.status(400).json({
      error: "All schedule fields are required."
    });
  }


  db.run(
    `
    UPDATE collection_schedules

    SET
      suburb = ?,
      bin_type = ?,
      collection_date = ?,
      collection_day = ?

    WHERE id = ?
    `,
    [
      suburb.trim(),
      bin_type.trim(),
      collection_date,
      collection_day.trim(),
      req.params.id
    ],
    function (err) {

      if (err) {

        console.error(err);

        return res.status(500).json({
          error: "Unable to update schedule."
        });
      }

      res.json({
        message: "Schedule updated."
      });
    }
  );
});


// ==========================================
// DELETE SCHEDULE
// ==========================================

app.delete("/api/schedules/:id", (req, res) => {

  db.run(
    "DELETE FROM collection_schedules WHERE id = ?",
    [req.params.id],
    function (err) {

      if (err) {

        console.error(err);

        return res.status(500).json({
          error: "Unable to delete schedule."
        });
      }

      res.json({
        message: "Schedule deleted."
      });
    }
  );
});


// ==========================================
// RECYCLING GUIDE API
// ==========================================

app.get("/api/recycling", (req, res) => {

  const q =
    (req.query.q || "").trim();


  if (!q) {

    return db.all(
      `
      SELECT *
      FROM recycling_items
      ORDER BY item_name
      `,
      [],
      (err, rows) => {

        if (err) {

          console.error(err);

          return res.status(500).json({
            error:
              "Unable to load recycling guide."
          });
        }

        res.json(rows);
      }
    );
  }


  const wildcard = `%${q}%`;


  db.all(
    `
    SELECT *
    FROM recycling_items

    WHERE
      item_name LIKE ?
      OR category LIKE ?
      OR disposal_instruction LIKE ?

    ORDER BY item_name
    `,
    [
      wildcard,
      wildcard,
      wildcard
    ],
    (err, rows) => {

      if (err) {

        console.error(err);

        return res.status(500).json({
          error:
            "Unable to search recycling guide."
        });
      }

      res.json(rows);
    }
  );
});


// ==========================================
// LIBRARY API
// ==========================================

app.get("/api/library", (req, res) => {

  const q =
    (req.query.q || "").trim();


  if (!q) {

    return db.all(
      `
      SELECT *
      FROM library
      ORDER BY item_name
      `,
      [],
      (err, rows) => {

        if (err) {

          console.error(err);

          return res.status(500).json({
            error: "Unable to load library."
          });
        }

        res.json(rows);
      }
    );
  }


  const wildcard = `%${q}%`;


  db.all(
    `
    SELECT *
    FROM library

    WHERE
      item_name LIKE ?
      OR category LIKE ?
      OR bin_type LIKE ?
      OR instruction LIKE ?

    ORDER BY item_name
    `,
    [
      wildcard,
      wildcard,
      wildcard,
      wildcard
    ],
    (err, rows) => {

      if (err) {

        console.error(err);

        return res.status(500).json({
          error: "Unable to search library."
        });
      }

      res.json(rows);
    }
  );
});


// ==========================================
// GET ALL REPORTS - ADMIN
// ==========================================

app.get("/api/reports", (req, res) => {

  db.all(
    `
    SELECT *
    FROM reports
    ORDER BY id DESC
    `,
    [],
    (err, rows) => {

      if (err) {

        console.error(err);

        return res.status(500).json({
          error: "Unable to load reports."
        });
      }

      res.json(rows);
    }
  );
});


// ==========================================
// SUBMIT RESIDENT REPORT
// ==========================================

app.post("/api/reports", (req, res) => {

  const {
    name,
    email,
    suburb,
    issue_type,
    description,
    report_date
  } = req.body;


  if (
    !name ||
    !email ||
    !suburb ||
    !issue_type ||
    !description ||
    !report_date
  ) {

    return res.status(400).json({
      error:
        "Please complete all required fields."
    });
  }


  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  if (!emailPattern.test(email)) {

    return res.status(400).json({
      error:
        "Please enter a valid email address."
    });
  }


  db.run(
    `
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

    VALUES (?, ?, ?, ?, ?, ?, 'Open')
    `,
    [
      name.trim(),
      email.trim(),
      suburb.trim(),
      issue_type.trim(),
      description.trim(),
      report_date
    ],
    function (err) {

      if (err) {

        console.error(err);

        return res.status(500).json({
          error:
            "Unable to submit report."
        });
      }


      const reference =
        `WASTE-${String(this.lastID).padStart(4, "0")}`;


      res.status(201).json({

        id: this.lastID,

        reference,

        message:
          "Your issue has been submitted successfully."

      });
    }
  );
});


// ==========================================
// TRACK RESIDENT REPORT
// Requires reference AND email
// ==========================================

app.post("/api/track", (req, res) => {

  const reference =
    String(req.body.reference || "")
      .trim()
      .toUpperCase();

  const email =
    String(req.body.email || "")
      .trim()
      .toLowerCase();


  if (!reference || !email) {

    return res.status(400).json({
      error:
        "Please enter your reference number and email address."
    });
  }


  const referenceMatch =
    reference.match(/^WASTE-(\d+)$/);


  if (!referenceMatch) {

    return res.status(400).json({
      error:
        "Invalid reference number. Example: WASTE-0001"
    });
  }


  const reportId =
    parseInt(referenceMatch[1], 10);


  db.get(
    `
    SELECT
      id,
      suburb,
      issue_type,
      description,
      report_date,
      status

    FROM reports

    WHERE
      id = ?
      AND LOWER(email) = LOWER(?)
    `,
    [
      reportId,
      email
    ],
    (err, report) => {

      if (err) {

        console.error(err);

        return res.status(500).json({
          error:
            "Unable to track report."
        });
      }


      if (!report) {

        return res.status(404).json({
          error:
            "No report was found with that reference number and email address."
        });
      }


      res.json({

        reference:
          `WASTE-${String(report.id).padStart(4, "0")}`,

        suburb:
          report.suburb,

        issue_type:
          report.issue_type,

        description:
          report.description,

        report_date:
          report.report_date,

        status:
          report.status

      });
    }
  );
});


// ==========================================
// ADMIN UPDATE REPORT STATUS
// ==========================================

app.patch(
  "/api/reports/:id/status",
  (req, res) => {

    const allowed = [
      "Open",
      "In Progress",
      "Resolved"
    ];


    const { status } = req.body;


    if (!allowed.includes(status)) {

      return res.status(400).json({
        error: "Invalid status."
      });
    }


    db.run(
      `
      UPDATE reports
      SET status = ?
      WHERE id = ?
      `,
      [
        status,
        req.params.id
      ],
      function (err) {

        if (err) {

          console.error(err);

          return res.status(500).json({
            error:
              "Unable to update report status."
          });
        }


        if (this.changes === 0) {

          return res.status(404).json({
            error: "Report not found."
          });
        }


        res.json({
          message:
            "Report status updated."
        });
      }
    );
  }
);


// ==========================================
// ADMIN DASHBOARD STATISTICS
// ==========================================

app.get("/api/dashboard", (req, res) => {

  const result = {};


  db.get(
    "SELECT COUNT(*) AS total FROM reports",
    [],
    (err, row) => {

      if (err) {

        return res.status(500).json({
          error:
            "Unable to load dashboard."
        });
      }


      result.total = row.total;


      db.all(
        `
        SELECT
          status,
          COUNT(*) AS count

        FROM reports

        GROUP BY status
        `,
        [],
        (err2, rows) => {

          if (err2) {

            return res.status(500).json({
              error:
                "Unable to load dashboard."
            });
          }


          result.open = 0;
          result.inProgress = 0;
          result.resolved = 0;


          rows.forEach(row => {

            if (row.status === "Open") {
              result.open = row.count;
            }

            if (row.status === "In Progress") {
              result.inProgress = row.count;
            }

            if (row.status === "Resolved") {
              result.resolved = row.count;
            }

          });


          db.get(
            `
            SELECT COUNT(*) AS count
            FROM collection_schedules
            WHERE collection_date >= date('now')
            `,
            [],
            (err3, row3) => {

              if (err3) {

                return res.status(500).json({
                  error:
                    "Unable to load dashboard."
                });
              }


              result.upcomingCollections =
                row3.count;


              res.json(result);
            }
          );
        }
      );
    }
  );
});


// ==========================================
// DATABASE TEST
// ==========================================

app.get("/api/database-test", (req, res) => {

  db.get(
    "SELECT datetime('now') AS database_time",
    [],
    (err, row) => {

      if (err) {

        return res.status(500).json({
          connected: false,
          error: err.message
        });
      }


      res.json({

        connected: true,

        message:
          "SQLite database is connected.",

        database_time:
          row.database_time

      });
    }
  );
});


// ==========================================
// 404
// ==========================================

app.use((req, res) => {

  res.status(404).send(
    "Page not found."
  );

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

  console.log(
    `Smart Waste Management app running at http://localhost:${PORT}`
  );

});