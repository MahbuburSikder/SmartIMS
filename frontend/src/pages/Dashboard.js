import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://smartims-backend-erel.onrender.com";

function Dashboard() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [editId, setEditId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [reorders, setReorders] = useState([]);
  const [showReorders, setShowReorders] = useState(false);
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole");
  const username = localStorage.getItem("username");
  const isAdmin = userRole === "admin";

  const LOW_STOCK_THRESHOLD = 5;

  const fetchItems = useCallback(() => {
    fetch(`${API}/api/items`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  const fetchAuditLogs = useCallback(() => {
    fetch(`${API}/api/audit`)
      .then((res) => res.json())
      .then((data) => setAuditLogs(data))
      .catch((err) => console.error("Error fetching audit logs:", err));
  }, []);

  const fetchReorders = useCallback(() => {
    fetch(`${API}/api/reorders`)
      .then((res) => res.json())
      .then((data) => setReorders(data))
      .catch((err) => console.error("Error fetching reorders:", err));
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      fetchItems();
      fetchAuditLogs();
      fetchReorders();
    }
  }, [navigate, fetchItems, fetchAuditLogs, fetchReorders]);

  const handleAdd = () => {
    if (!name || !quantity) {
      alert("Please enter item name and quantity");
      return;
    }
    fetch(`${API}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, quantity: parseInt(quantity),
        username: username || "admin"
      }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchItems();
        fetchAuditLogs();
        fetchReorders();
        setName("");
        setQuantity("");
      })
      .catch((err) => console.error("Error adding item:", err));
  };

  const handleDelete = (id) => {
    fetch(`${API}/api/items/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username || "admin" }),
    })
      .then(() => {
        fetchItems();
        fetchAuditLogs();
        fetchReorders();
      })
      .catch((err) => console.error("Error deleting item:", err));
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setEditQuantity(item.quantity);
  };

  const handleSave = (id) => {
    if (!editQuantity && editQuantity !== 0) {
      alert("Please enter a quantity");
      return;
    }
    fetch(`${API}/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity: parseInt(editQuantity),
        username: username || "admin"
      }),
    })
      .then(() => {
        setEditId(null);
        setEditQuantity("");
        fetchItems();
        fetchAuditLogs();
        fetchReorders();
      })
      .catch((err) => console.error("Error updating item:", err));
  };

  const handleCancel = () => {
    setEditId(null);
    setEditQuantity("");
  };

  const handleReorderDone = (id) => {
    fetch(`${API}/api/reorders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    })
      .then(() => fetchReorders())
      .catch((err) => console.error("Error updating reorder:", err));
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    navigate("/");
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp + 'Z').toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true
    });
  };

  const lowStockItems = items.filter(
    (item) => item.quantity < LOW_STOCK_THRESHOLD
  );
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const pendingReorders = reorders.filter((r) => r.status === "PENDING").length;

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action) => {
    if (action === "ADDED") return "#4caf50";
    if (action === "DELETED") return "#f44336";
    if (action === "UPDATED") return "#ff9800";
    return "#999";
  };

  return (
    <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        backgroundColor: "#0d1b2a", padding: "15px 30px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h2 style={{ color: "white", margin: 0 }}>SmartIMS Dashboard</h2>
          <span style={{
            backgroundColor: isAdmin ? "#00bcd4" : "#4caf50",
            color: "white", padding: "3px 10px", borderRadius: "20px",
            fontSize: "12px", fontWeight: "bold"
          }}>
            {isAdmin ? "👑 Admin" : "👤 Staff"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {isAdmin && (
            <>
              <button onClick={() => navigate("/analytics")}
                style={{
                  backgroundColor: "#673ab7", color: "white", border: "none",
                  padding: "10px 20px", cursor: "pointer",
                  borderRadius: "5px", fontWeight: "bold"
                }}>
                📊 Analytics
              </button>
              <button onClick={() => setShowReorders(!showReorders)}
                style={{
                  backgroundColor: showReorders ? "#ff9800" : "#9c27b0",
                  color: "white", border: "none", padding: "10px 20px",
                  cursor: "pointer", borderRadius: "5px", fontWeight: "bold"
                }}>
                🔄 Reorders {pendingReorders > 0
                  ? `(${pendingReorders} pending)` : ""}
              </button>
              <button onClick={() => setShowAudit(!showAudit)}
                style={{
                  backgroundColor: showAudit ? "#ff9800" : "#4caf50",
                  color: "white", border: "none", padding: "10px 20px",
                  cursor: "pointer", borderRadius: "5px", fontWeight: "bold"
                }}>
                {showAudit ? "Hide Audit Log" : "📋 Audit Log"}
              </button>
            </>
          )}
          <button onClick={handleLogout}
            style={{
              backgroundColor: "#00bcd4", color: "white", border: "none",
              padding: "10px 20px", cursor: "pointer",
              borderRadius: "5px", fontWeight: "bold"
            }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: "30px" }}>

        {/* Summary Stats */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "25px" }}>
          <div style={{
            backgroundColor: "white", borderRadius: "10px",
            padding: "20px 30px", flex: 1, textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <p style={{ color: "#666", margin: "0 0 5px 0", fontSize: "13px" }}>
              Total Products
            </p>
            <h2 style={{ margin: 0, color: "#0d1b2a" }}>{totalItems}</h2>
          </div>
          <div style={{
            backgroundColor: "white", borderRadius: "10px",
            padding: "20px 30px", flex: 1, textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <p style={{ color: "#666", margin: "0 0 5px 0", fontSize: "13px" }}>
              Total Stock Units
            </p>
            <h2 style={{ margin: 0, color: "#0d1b2a" }}>{totalQuantity}</h2>
          </div>
          <div style={{
            backgroundColor: lowStockItems.length > 0 ? "#ffe6e6" : "white",
            borderRadius: "10px", padding: "20px 30px", flex: 1,
            textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <p style={{ color: "#666", margin: "0 0 5px 0", fontSize: "13px" }}>
              Low Stock Items
            </p>
            <h2 style={{
              margin: 0,
              color: lowStockItems.length > 0 ? "red" : "#0d1b2a"
            }}>
              {lowStockItems.length}
            </h2>
          </div>
          {isAdmin && (
            <div style={{
              backgroundColor: pendingReorders > 0 ? "#f3e5f5" : "white",
              borderRadius: "10px", padding: "20px 30px", flex: 1,
              textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}>
              <p style={{ color: "#666", margin: "0 0 5px 0", fontSize: "13px" }}>
                Pending Reorders
              </p>
              <h2 style={{
                margin: 0,
                color: pendingReorders > 0 ? "#9c27b0" : "#0d1b2a"
              }}>
                {pendingReorders}
              </h2>
            </div>
          )}
        </div>

        {/* Low Stock Alert Banner */}
        {lowStockItems.length > 0 && (
          <div style={{
            backgroundColor: "#fff3cd", border: "1px solid #ffc107",
            borderRadius: "8px", padding: "15px 20px", marginBottom: "25px"
          }}>
            <h4 style={{ color: "#856404", margin: "0 0 10px 0" }}>
              ⚠️ Low Stock Alert — {lowStockItems.length} item(s) running low!
            </h4>
            {lowStockItems.map((item) => (
              <p key={item.id} style={{ color: "#856404", margin: "4px 0" }}>
                • <strong>{item.name}</strong> — only {item.quantity} left
                (minimum threshold: {LOW_STOCK_THRESHOLD})
              </p>
            ))}
          </div>
        )}

        {/* Add New Item — Admin only */}
        {isAdmin && (
          <div style={{
            backgroundColor: "white", borderRadius: "10px",
            padding: "20px 25px", marginBottom: "25px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <h3 style={{ marginTop: 0 }}>Add New Item</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: "8px", width: "200px", borderRadius: "4px",
                  border: "1px solid #ccc"
                }}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  padding: "8px", width: "120px", borderRadius: "4px",
                  border: "1px solid #ccc"
                }}
              />
              <button onClick={handleAdd}
                style={{
                  backgroundColor: "#00bcd4", color: "white", border: "none",
                  padding: "8px 20px", borderRadius: "4px",
                  cursor: "pointer", fontWeight: "bold"
                }}>
                Add Item
              </button>
            </div>
          </div>
        )}

        {/* Staff notice */}
        {!isAdmin && (
          <div style={{
            backgroundColor: "#e3f2fd", border: "1px solid #90caf9",
            borderRadius: "8px", padding: "12px 20px", marginBottom: "25px"
          }}>
            <p style={{ margin: 0, color: "#1565c0", fontSize: "14px" }}>
              👤 You are logged in as <strong>Staff</strong> — view only access.
              Contact an Admin to make changes.
            </p>
          </div>
        )}

        {/* Inventory Table */}
        <div style={{
          backgroundColor: "white", borderRadius: "10px",
          padding: "20px 25px", marginBottom: "25px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <h3 style={{ marginTop: 0 }}>Inventory List</h3>
          <div style={{ marginBottom: "15px" }}>
            <input
              type="text"
              placeholder="🔍 Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "10px", width: "300px", borderRadius: "6px",
                border: "1px solid #ccc", fontSize: "14px"
              }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}
                style={{
                  marginLeft: "10px", padding: "10px 16px",
                  backgroundColor: "#ccc", border: "none",
                  borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
                }}>
                Clear
              </button>
            )}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#0d1b2a", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "center" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Quantity</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Status</th>
                {isAdmin && (
                  <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? "4" : "3"} style={{
                    textAlign: "center", padding: "20px", color: "#999"
                  }}>
                    {searchTerm
                      ? `No items found for "${searchTerm}"`
                      : "No items yet. Add your first item above!"}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: item.quantity < LOW_STOCK_THRESHOLD
                      ? "#ffe6e6" : "white"
                  }}>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      {item.name}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      {editId === item.id ? (
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          style={{
                            width: "70px", padding: "4px", borderRadius: "4px",
                            border: "1px solid #ccc", textAlign: "center"
                          }}
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      {item.quantity < LOW_STOCK_THRESHOLD ? (
                        <span style={{ color: "red", fontWeight: "bold" }}>
                          ⚠️ Low Stock
                        </span>
                      ) : (
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          ✅ OK
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        {editId === item.id ? (
                          <div style={{ display: "flex", gap: "6px",
                            justifyContent: "center" }}>
                            <button onClick={() => handleSave(item.id)}
                              style={{
                                backgroundColor: "green", color: "white",
                                border: "none", padding: "6px 12px",
                                borderRadius: "4px", cursor: "pointer"
                              }}>
                              Save
                            </button>
                            <button onClick={handleCancel}
                              style={{
                                backgroundColor: "gray", color: "white",
                                border: "none", padding: "6px 12px",
                                borderRadius: "4px", cursor: "pointer"
                              }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "6px",
                            justifyContent: "center" }}>
                            <button onClick={() => handleEditClick(item)}
                              style={{
                                backgroundColor: "#ff9800", color: "white",
                                border: "none", padding: "6px 14px",
                                borderRadius: "4px", cursor: "pointer"
                              }}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(item.id)}
                              style={{
                                backgroundColor: "red", color: "white",
                                border: "none", padding: "6px 14px",
                                borderRadius: "4px", cursor: "pointer"
                              }}>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Inventory Chart */}
        <div style={{
          backgroundColor: "white", borderRadius: "10px",
          padding: "20px 25px", marginBottom: "25px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <h3 style={{ marginTop: 0 }}>Inventory Chart</h3>
          {filteredItems.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center" }}>
              No data to display yet.
            </p>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} style={{
                marginBottom: "15px", display: "flex",
                alignItems: "center", gap: "10px"
              }}>
                <span style={{ width: "130px", fontSize: "14px" }}>
                  {item.name}
                </span>
                <div style={{
                  backgroundColor: "#e0e0e0", width: "65%",
                  height: "26px", borderRadius: "4px"
                }}>
                  <div style={{
                    width: `${Math.min(item.quantity * 5, 100)}%`,
                    backgroundColor: item.quantity < LOW_STOCK_THRESHOLD
                      ? "#e53935" : "#00bcd4",
                    height: "100%", borderRadius: "4px",
                    transition: "width 0.3s ease"
                  }} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                  {item.quantity}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Reorder Requests — Admin only */}
        {isAdmin && showReorders && (
          <div style={{
            backgroundColor: "white", borderRadius: "10px",
            padding: "20px 25px", marginBottom: "25px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <h3 style={{ marginTop: 0 }}>🔄 Reorder Requests</h3>
            {reorders.length === 0 ? (
              <p style={{ color: "#999", textAlign: "center" }}>
                No reorder requests yet.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0d1b2a", color: "white" }}>
                    <th style={{ padding: "12px", textAlign: "center" }}>Item</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>
                      Quantity at Alert
                    </th>
                    <th style={{ padding: "12px", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>Created</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reorders.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        {r.item_name}
                      </td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        {r.current_quantity}
                      </td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <span style={{
                          backgroundColor: r.status === "PENDING"
                            ? "#ff9800" : "#4caf50",
                          color: "white", padding: "3px 10px",
                          borderRadius: "20px", fontSize: "12px",
                          fontWeight: "bold"
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "center",
                        fontSize: "13px", color: "#666" }}>
                        {formatTimestamp(r.created_at)}
                      </td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        {r.status === "PENDING" ? (
                          <button onClick={() => handleReorderDone(r.id)}
                            style={{
                              backgroundColor: "#4caf50", color: "white",
                              border: "none", padding: "6px 14px",
                              borderRadius: "4px", cursor: "pointer"
                            }}>
                            Mark Reordered
                          </button>
                        ) : (
                          <span style={{ color: "#4caf50", fontWeight: "bold" }}>
                            ✅ Done
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Audit Log — Admin only */}
        {isAdmin && showAudit && (
          <div style={{
            backgroundColor: "white", borderRadius: "10px",
            padding: "20px 25px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <h3 style={{ marginTop: 0 }}>📋 Audit Log</h3>
            {auditLogs.length === 0 ? (
              <p style={{ color: "#999", textAlign: "center" }}>
                No activity recorded yet.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0d1b2a", color: "white" }}>
                    <th style={{ padding: "12px", textAlign: "center" }}>User</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>Item</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        {log.username}
                      </td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <span style={{
                          backgroundColor: getActionColor(log.action),
                          color: "white", padding: "3px 10px",
                          borderRadius: "20px", fontSize: "12px",
                          fontWeight: "bold"
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        {log.item_name}
                      </td>
                      <td style={{ padding: "10px", textAlign: "center",
                        fontSize: "13px", color: "#666" }}>
                        {formatTimestamp(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;