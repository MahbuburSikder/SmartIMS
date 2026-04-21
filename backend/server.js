const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();

app.use(cors());
app.use(express.json());

const db = new Database("inventory.db");

// Create items table
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL
  )
`);

// Create audit log table
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    action TEXT NOT NULL,
    item_name TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ✅ Create reorder requests table
db.exec(`
  CREATE TABLE IF NOT EXISTS reorder_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    current_quantity INTEGER NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Test route
app.get("/", (req, res) => {
  res.send("SmartIMS Backend is Running 🚀");
});

// GET all items
app.get("/api/items", (req, res) => {
  const items = db.prepare("SELECT * FROM items").all();
  res.json(items);
});

// POST new item
app.post("/api/items", (req, res) => {
  const { name, quantity, username } = req.body;
  if (!name || !quantity) {
    return res.status(400).json({ error: "Name and quantity required" });
  }
  const stmt = db.prepare("INSERT INTO items (name, quantity) VALUES (?, ?)");
  const result = stmt.run(name, quantity);

  // Log the action
  db.prepare("INSERT INTO audit_log (username, action, item_name) VALUES (?, ?, ?)")
    .run(username || "unknown", "ADDED", name);

  // ✅ Auto reorder if quantity is low
  if (parseInt(quantity) < 5) {
    const existing = db.prepare(
      "SELECT * FROM reorder_requests WHERE item_name = ? AND status = 'PENDING'"
    ).get(name);
    if (!existing) {
      db.prepare(
        "INSERT INTO reorder_requests (item_name, current_quantity) VALUES (?, ?)"
      ).run(name, quantity);
    }
  }

  res.status(201).json({ id: result.lastInsertRowid, name, quantity });
});

// DELETE item
app.delete("/api/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { username } = req.body;

  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
  db.prepare("DELETE FROM items WHERE id = ?").run(id);

  if (item) {
    db.prepare("INSERT INTO audit_log (username, action, item_name) VALUES (?, ?, ?)")
      .run(username || "unknown", "DELETED", item.name);

    // ✅ Remove any pending reorder for deleted item
    db.prepare(
      "DELETE FROM reorder_requests WHERE item_name = ? AND status = 'PENDING'"
    ).run(item.name);
  }

  res.json({ message: "Item deleted" });
});

// PUT update item
app.put("/api/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { quantity, username } = req.body;

  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
  db.prepare("UPDATE items SET quantity = ? WHERE id = ?").run(quantity, id);

  if (item) {
    db.prepare("INSERT INTO audit_log (username, action, item_name) VALUES (?, ?, ?)")
      .run(username || "unknown", "UPDATED", item.name);

    // ✅ Auto reorder if updated quantity is low
    if (parseInt(quantity) < 5) {
      const existing = db.prepare(
        "SELECT * FROM reorder_requests WHERE item_name = ? AND status = 'PENDING'"
      ).get(item.name);
      if (!existing) {
        db.prepare(
          "INSERT INTO reorder_requests (item_name, current_quantity) VALUES (?, ?)"
        ).run(item.name, quantity);
      }
    } else {
      // ✅ Remove reorder request if quantity is now OK
      db.prepare(
        "DELETE FROM reorder_requests WHERE item_name = ? AND status = 'PENDING'"
      ).run(item.name);
    }
  }

  res.json({ message: "Item updated" });
});

// GET audit log
app.get("/api/audit", (req, res) => {
  const logs = db.prepare(
    "SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 50"
  ).all();
  res.json(logs);
});

// ✅ GET reorder requests
app.get("/api/reorders", (req, res) => {
  const reorders = db.prepare(
    "SELECT * FROM reorder_requests ORDER BY created_at DESC"
  ).all();
  res.json(reorders);
});

// ✅ Mark reorder as done
app.put("/api/reorders/:id", (req, res) => {
  const id = parseInt(req.params.id);
  db.prepare(
    "UPDATE reorder_requests SET status = 'REORDERED' WHERE id = ?"
  ).run(id);
  res.json({ message: "Reorder marked as done" });
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

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});