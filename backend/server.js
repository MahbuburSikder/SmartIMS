const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// ──────────────────────────────────────────────
// Middleware Configuration
// ──────────────────────────────────────────────

// Allow cross-origin requests from any domain (required for Netlify frontend)
app.use(cors({ origin: "*" }));

// Parse incoming JSON request bodies
app.use(express.json());

// ──────────────────────────────────────────────
// PostgreSQL Database Connection
// ──────────────────────────────────────────────

// Create a connection pool to the PostgreSQL database hosted on Render
// SSL is required for Render's managed PostgreSQL instances
const pool = new Pool({
  connectionString: "postgresql://smartims_db_user:oBoVzAL1JVGwUU9hLXUrC9XbfnfwXqYV@dpg-d7ri3j3bc2fs738cn94g-a.oregon-postgres.render.com/smartims_db",
  ssl: { rejectUnauthorized: false }
});

// ──────────────────────────────────────────────
// Database Initialisation
// ──────────────────────────────────────────────

// Creates all required tables if they do not already exist
// This ensures the database schema is always in sync on startup
const initDB = async () => {
  // Items table stores all inventory products and their quantities
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL
    )
  `);

  // Audit log table records every action performed by any user
  // Used for accountability and security monitoring
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      item_name TEXT NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Reorder requests table tracks items that have fallen below
  // the minimum stock threshold and require replenishment
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

// Run database initialisation on server startup
initDB();

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

// Health check route — confirms backend is running
app.get("/", (req, res) => {
  res.send("SmartIMS Backend is Running 🚀");
});

// ──────────────────────────────────────────────
// Items Routes
// ──────────────────────────────────────────────

// GET /api/items
// Returns all inventory items ordered by ID
app.get("/api/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    // Log error and return 500 status if database query fails
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/items
// Creates a new inventory item and logs the action
// Also creates a reorder request if quantity is below threshold
app.post("/api/items", async (req, res) => {
  try {
    const { name, quantity, username } = req.body;

    // Validate required fields
    if (!name || !quantity) {
      return res.status(400).json({ error: "Name and quantity required" });
    }

    // Insert new item into database
    const result = await pool.query(
      "INSERT INTO items (name, quantity) VALUES ($1, $2) RETURNING *",
      [name, quantity]
    );

    // Record this action in the audit log for accountability
    await pool.query(
      "INSERT INTO audit_log (username, action, item_name) VALUES ($1, $2, $3)",
      [username || "unknown", "ADDED", name]
    );

    // Auto-generate reorder request if quantity is below minimum threshold (5)
    if (parseInt(quantity) < 5) {
      const existing = await pool.query(
        "SELECT * FROM reorder_requests WHERE item_name = $1 AND status = 'PENDING'",
        [name]
      );
      // Only create one pending reorder per item to avoid duplicates
      if (existing.rows.length === 0) {
        await pool.query(
          "INSERT INTO reorder_requests (item_name, current_quantity) VALUES ($1, $2)",
          [name, quantity]
        );
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/items/:id
// Removes an item from inventory, logs the deletion,
// and removes any associated pending reorder requests
app.delete("/api/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { username } = req.body;

    // Retrieve item details before deletion for audit logging
    const item = await pool.query("SELECT * FROM items WHERE id = $1", [id]);

    // Delete the item from inventory
    await pool.query("DELETE FROM items WHERE id = $1", [id]);

    if (item.rows.length > 0) {
      // Log the deletion action with the username
      await pool.query(
        "INSERT INTO audit_log (username, action, item_name) VALUES ($1, $2, $3)",
        [username || "unknown", "DELETED", item.rows[0].name]
      );

      // Remove any pending reorder requests for the deleted item
      await pool.query(
        "DELETE FROM reorder_requests WHERE item_name = $1 AND status = 'PENDING'",
        [item.rows[0].name]
      );
    }

    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/items/:id
// Updates the quantity of an existing item
// Automatically manages reorder requests based on new quantity
app.put("/api/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { quantity, username } = req.body;

    // Retrieve current item details for audit logging
    const item = await pool.query("SELECT * FROM items WHERE id = $1", [id]);

    // Update the item quantity in the database
    await pool.query(
      "UPDATE items SET quantity = $1 WHERE id = $2",
      [quantity, id]
    );

    if (item.rows.length > 0) {
      // Log the update action with username
      await pool.query(
        "INSERT INTO audit_log (username, action, item_name) VALUES ($1, $2, $3)",
        [username || "unknown", "UPDATED", item.rows[0].name]
      );

      // If new quantity is below threshold, create a reorder request
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
        // If quantity is now healthy, remove any pending reorder requests
        await pool.query(
          "DELETE FROM reorder_requests WHERE item_name = $1 AND status = 'PENDING'",
          [item.rows[0].name]
        );
      }
    }

    res.json({ message: "Item updated" });
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// Audit Log Routes
// ──────────────────────────────────────────────

// GET /api/audit
// Returns the 50 most recent audit log entries in descending order
app.get("/api/audit", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching audit log:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// Reorder Request Routes
// ──────────────────────────────────────────────

// GET /api/reorders
// Returns all reorder requests ordered by creation date
app.get("/api/reorders", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM reorder_requests ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching reorders:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/reorders/:id
// Marks a reorder request as completed (REORDERED status)
app.put("/api/reorders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query(
      "UPDATE reorder_requests SET status = 'REORDERED' WHERE id = $1",
      [id]
    );
    res.json({ message: "Reorder marked as done" });
  } catch (err) {
    console.error("Error updating reorder:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// Authentication Route
// ──────────────────────────────────────────────

// POST /api/login
// Validates user credentials and returns role information
// Supports two roles: admin (full access) and staff (view only)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Hardcoded user credentials with role assignments
  // In production, these would be stored securely in the database
  const users = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "staff", password: "staff123", role: "staff" },
  ];

  // Find matching user by username and password
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Return success with role for frontend access control
    res.json({ success: true, role: user.role, message: "Login successful" });
  } else {
    // Return 401 Unauthorized if credentials don't match
    res.status(401).json({
      success: false, message: "Invalid username or password"
    });
  }
});

// ──────────────────────────────────────────────
// Server Startup
// ──────────────────────────────────────────────

// Use Render's dynamic PORT environment variable or fallback to 5001 locally
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});