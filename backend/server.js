const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ PostgreSQL connection
const pool = new Pool({
  connectionString: "postgresql://smartims_db_user:oBoVzAL1JVGwUU9hLXUrC9XbfnfwXqYV@dpg-d7ri3j3bc2fs738cn94g-a.oregon-postgres.render.com/smartims_db",
  ssl: { rejectUnauthorized: false }
});

// ✅ Create tables if they don't exist
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      item_name TEXT NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reorder_requests (
      id SERIAL PRIMARY KEY,
      item_name TEXT NOT NULL,
      current_quantity INTEGER NOT NULL,
      status TEXT DEFAULT 'PENDING',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  console.log("✅ Database tables ready");
};

initDB();

// Test route
app.get("/", (req, res) => {
  res.send("SmartIMS Backend is Running 🚀");
});

// GET all items
app.get("/api/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new item
app.post("/api/items", async (req, res) => {
  try {
    const { name, quantity, username } = req.body;
    if (!name || !quantity) {
      return res.status(400).json({ error: "Name and quantity required" });
    }

    const result = await pool.query(
      "INSERT INTO items (name, quantity) VALUES ($1, $2) RETURNING *",
      [name, quantity]
    );

    await pool.query(
      "INSERT INTO audit_log (username, action, item_name) VALUES ($1, $2, $3)",
      [username || "unknown", "ADDED", name]
    );

    if (parseInt(quantity) < 5) {
      const existing = await pool.query(
        "SELECT * FROM reorder_requests WHERE item_name = $1 AND status = 'PENDING'",
        [name]
      );
      if (existing.rows.length === 0) {
        await pool.query(
          "INSERT INTO reorder_requests (item_name, current_quantity) VALUES ($1, $2)",
          [name, quantity]
        );
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE item
app.delete("/api/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { username } = req.body;

    const item = await pool.query("SELECT * FROM items WHERE id = $1", [id]);

    await pool.query("DELETE FROM items WHERE id = $1", [id]);

    if (item.rows.length > 0) {
      await pool.query(
        "INSERT INTO audit_log (username, action, item_name) VALUES ($1, $2, $3)",
        [username || "unknown", "DELETED", item.rows[0].name]
      );
      await pool.query(
        "DELETE FROM reorder_requests WHERE item_name = $1 AND status = 'PENDING'",
        [item.rows[0].name]
      );
    }

    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update item
app.put("/api/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { quantity, username } = req.body;

    const item = await pool.query("SELECT * FROM items WHERE id = $1", [id]);

    await pool.query(
      "UPDATE items SET quantity = $1 WHERE id = $2",
      [quantity, id]
    );

    if (item.rows.length > 0) {
      await pool.query(
        "INSERT INTO audit_log (username, action, item_name) VALUES ($1, $2, $3)",
        [username || "unknown", "UPDATED", item.rows[0].name]
      );

      if (parseInt(quantity) < 5) {
        const existing = await pool.query(
          "SELECT * FROM reorder_requests WHERE item_name = $1 AND status = 'PENDING'",
          [item.rows[0].name]
        );
        if (existing.rows.length === 0) {
          await pool.query(
            "INSERT INTO reorder_requests (item_name, current_quantity) VALUES ($1, $2)",
            [item.rows[0].name, quantity]
          );
        }
      } else {
        await pool.query(
          "DELETE FROM reorder_requests WHERE item_name = $1 AND status = 'PENDING'",
          [item.rows[0].name]
        );
      }
    }

    res.json({ message: "Item updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET audit log
app.get("/api/audit", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET reorder requests
app.get("/api/reorders", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM reorder_requests ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT mark reorder done
app.put("/api/reorders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query(
      "UPDATE reorder_requests SET status = 'REORDERED' WHERE id = $1",
      [id]
    );
    res.json({ message: "Reorder marked as done" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const users = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "staff", password: "staff123", role: "staff" },
  ];

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    res.json({ success: true, role: user.role, message: "Login successful" });
  } else {
    res.status(401).json({
      success: false, message: "Invalid username or password"
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});