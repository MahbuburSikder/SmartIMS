import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://smartims-backend-erel.onrender.com";

function Analytics() {
  const [items, setItems] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "admin";

  const LOW_STOCK_THRESHOLD = 5;

  const fetchItems = useCallback(() => {
    fetch(`${API}/api/items`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  const fetchAuditLogs = useCallback(() => {
    fetch(`${API}/api/audit`)
      .then((res) => res.json())
      .then((data) => setAuditLogs(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      fetchItems();
      fetchAuditLogs();
    }
  }, [navigate, fetchItems, fetchAuditLogs]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    navigate("/");
  };

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const avgQuantity = totalItems > 0
    ? (totalQuantity / totalItems).toFixed(1) : 0;
  const lowStockItems = items.filter(
    (i) => i.quantity < LOW_STOCK_THRESHOLD
  );
  const healthyItems = items.filter(
    (i) => i.quantity >= LOW_STOCK_THRESHOLD
  );

  const topStocked = [...items]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const mostAtRisk = [...items]
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5);

  const activityCount = {};
  auditLogs.forEach((log) => {
    activityCount[log.item_name] =
      (activityCount[log.item_name] || 0) + 1;
  });

  const mostActive = Object.entries(activityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const getForecast = (item) => {
    if (item.quantity === 0) return "🚨 Out of stock — reorder immediately";
    if (item.quantity < 3) return "🔴 Critical — reorder urgent";
    if (item.quantity < 5) return "🟠 Low — reorder soon";
    if (item.quantity < 15) return "🟡 Moderate — monitor closely";
    return "🟢 Healthy — no action needed";
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
          <h2 style={{ color: "white", margin: 0 }}>
            SmartIMS — Analytics
          </h2>
          <span style={{
            backgroundColor: isAdmin ? "#00bcd4" : "#4caf50",
            color: "white", padding: "3px 10px", borderRadius: "20px",
            fontSize: "12px", fontWeight: "bold"
          }}>
            {isAdmin ? "👑 Admin" : "👤 Staff"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/dashboard")}
            style={{
              backgroundColor: "#4caf50", color: "white", border: "none",
              padding: "10px 20px", cursor: "pointer",
              borderRadius: "5px", fontWeight: "bold"
            }}>
            ← Dashboard
          </button>
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
              Total Units
            </p>
            <h2 style={{ margin: 0, color: "#0d1b2a" }}>{totalQuantity}</h2>
          </div>
          <div style={{
            backgroundColor: "white", borderRadius: "10px",
            padding: "20px 30px", flex: 1, textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <p style={{ color: "#666", margin: "0 0 5px 0", fontSize: "13px" }}>
              Avg Stock Per Item
            </p>
            <h2 style={{ margin: 0, color: "#0d1b2a" }}>{avgQuantity}</h2>
          </div>
          <div style={{
            backgroundColor: "#e8f5e9", borderRadius: "10px",
            padding: "20px 30px", flex: 1, textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <p style={{ color: "#666", margin: "0 0 5px 0", fontSize: "13px" }}>
              Healthy Items
            </p>
            <h2 style={{ margin: 0, color: "#4caf50" }}>
              {healthyItems.length}
            </h2>
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
        </div>

        {/* Two column layout */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "25px" }}>

          {/* Most Stocked */}
          <div style={{
            backgroundColor: "white", borderRadius: "10px",
            padding: "20px 25px", flex: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <h3 style={{ marginTop: 0, color: "#0d1b2a" }}>
              📦 Most Stocked Items
            </h3>
            {topStocked.length === 0 ? (
              <p style={{ color: "#999" }}>No data yet.</p>
            ) : (
              topStocked.map((item, index) => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center",
                  gap: "10px", marginBottom: "12px"
                }}>
                  <span style={{
                    backgroundColor: "#0d1b2a", color: "white",
                    borderRadius: "50%", width: "24px", height: "24px",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "12px",
                    fontWeight: "bold", flexShrink: 0
                  }}>
                    {index + 1}
                  </span>
                  <span style={{ width: "120px", fontSize: "14px" }}>
                    {item.name}
                  </span>
                  <div style={{
                    backgroundColor: "#e0e0e0", flex: 1,
                    height: "22px", borderRadius: "4px"
                  }}>
                    <div style={{
                      width: `${Math.min(item.quantity * 3, 100)}%`,
                      backgroundColor: "#00bcd4",
                      height: "100%", borderRadius: "4px"
                    }} />
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "bold",
                    width: "30px" }}>
                    {item.quantity}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Most At Risk */}
          <div style={{
            backgroundColor: "white", borderRadius: "10px",
            padding: "20px 25px", flex: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <h3 style={{ marginTop: 0, color: "#0d1b2a" }}>
              ⚠️ Most At-Risk Items
            </h3>
            {mostAtRisk.length === 0 ? (
              <p style={{ color: "#999" }}>No data yet.</p>
            ) : (
              mostAtRisk.map((item, index) => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center",
                  gap: "10px", marginBottom: "12px"
                }}>
                  <span style={{
                    backgroundColor: item.quantity < LOW_STOCK_THRESHOLD
                      ? "#f44336" : "#0d1b2a",
                    color: "white", borderRadius: "50%",
                    width: "24px", height: "24px",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "12px",
                    fontWeight: "bold", flexShrink: 0
                  }}>
                    {index + 1}
                  </span>
                  <span style={{ width: "120px", fontSize: "14px" }}>
                    {item.name}
                  </span>
                  <div style={{
                    backgroundColor: "#e0e0e0", flex: 1,
                    height: "22px", borderRadius: "4px"
                  }}>
                    <div style={{
                      width: `${Math.min(item.quantity * 3, 100)}%`,
                      backgroundColor: item.quantity < LOW_STOCK_THRESHOLD
                        ? "#f44336" : "#00bcd4",
                      height: "100%", borderRadius: "4px"
                    }} />
                  </div>
                  <span style={{
                    fontSize: "14px", fontWeight: "bold", width: "30px",
                    color: item.quantity < LOW_STOCK_THRESHOLD ? "red" : "#0d1b2a"
                  }}>
                    {item.quantity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Active Items */}
        {isAdmin && (
          <div style={{
            backgroundColor: "white", borderRadius: "10px",
            padding: "20px 25px", marginBottom: "25px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <h3 style={{ marginTop: 0, color: "#0d1b2a" }}>
              📊 Most Active Items (by transactions)
            </h3>
            {mostActive.length === 0 ? (
              <p style={{ color: "#999" }}>No activity recorded yet.</p>
            ) : (
              mostActive.map(([itemName, count], index) => (
                <div key={itemName} style={{
                  display: "flex", alignItems: "center",
                  gap: "10px", marginBottom: "12px"
                }}>
                  <span style={{
                    backgroundColor: "#ff9800", color: "white",
                    borderRadius: "50%", width: "24px", height: "24px",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "12px",
                    fontWeight: "bold", flexShrink: 0
                  }}>
                    {index + 1}
                  </span>
                  <span style={{ width: "150px", fontSize: "14px" }}>
                    {itemName}
                  </span>
                  <div style={{
                    backgroundColor: "#e0e0e0", flex: 1,
                    height: "22px", borderRadius: "4px"
                  }}>
                    <div style={{
                      width: `${Math.min(count * 20, 100)}%`,
                      backgroundColor: "#ff9800",
                      height: "100%", borderRadius: "4px"
                    }} />
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "bold",
                    width: "80px" }}>
                    {count} actions
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Demand Forecast Table */}
        <div style={{
          backgroundColor: "white", borderRadius: "10px",
          padding: "20px 25px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <h3 style={{ marginTop: 0, color: "#0d1b2a" }}>
            🔮 Demand Forecast & Recommendations
          </h3>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "15px" }}>
            Based on current stock levels, here are restocking recommendations.
          </p>
          {items.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center" }}>
              No items to forecast yet.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#0d1b2a", color: "white" }}>
                  <th style={{ padding: "12px", textAlign: "center" }}>Item</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>
                    Current Stock
                  </th>
                  <th style={{ padding: "12px", textAlign: "center" }}>
                    Recommended Reorder Qty
                  </th>
                  <th style={{ padding: "12px", textAlign: "center" }}>
                    Forecast
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: item.quantity < LOW_STOCK_THRESHOLD
                      ? "#ffe6e6" : "white"
                  }}>
                    <td style={{ padding: "10px", textAlign: "center",
                      fontWeight: "bold" }}>
                      {item.name}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center",
                      color: "#9c27b0", fontWeight: "bold" }}>
                      {item.quantity < 5
                        ? `+${20 - item.quantity} units`
                        : "No reorder needed"}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      {getForecast(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

export default Analytics;