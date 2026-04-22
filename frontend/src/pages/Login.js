import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");

    fetch("https://smartims-backend-erel.onrender.com/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", data.role);
          localStorage.setItem("username", username);
          navigate("/dashboard");
        } else {
          setError(data.message);
        }
      })
      .catch(() => {
        setLoading(false);
        setError("Cannot connect to server. Make sure backend is running.");
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      height: "100vh", backgroundColor: "#f0f2f5"
    }}>
      <div style={{
        backgroundColor: "white", padding: "40px", borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: "350px"
      }}>
        <h2 style={{ textAlign: "center", color: "#0d1b2a", marginBottom: "8px" }}>
          SmartIMS
        </h2>
        <p style={{ textAlign: "center", color: "#666",
          marginBottom: "30px", fontSize: "14px" }}>
          Sign in to your account
        </p>

        {error && (
          <div style={{
            backgroundColor: "#ffe6e6", border: "1px solid red",
            borderRadius: "6px", padding: "10px", marginBottom: "15px",
            color: "red", fontSize: "14px", textAlign: "center"
          }}>
            ❌ {error}
          </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px",
            fontWeight: "bold", color: "#333", fontSize: "14px" }}>
            Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: "100%", padding: "10px", borderRadius: "6px",
              border: "1px solid #ccc", fontSize: "14px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{ display: "block", marginBottom: "6px",
            fontWeight: "bold", color: "#333", fontSize: "14px" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: "100%", padding: "10px", borderRadius: "6px",
              border: "1px solid #ccc", fontSize: "14px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "12px",
            backgroundColor: loading ? "#aaa" : "#00bcd4",
            color: "white", border: "none", borderRadius: "6px",
            fontSize: "16px", fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer"
          }}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <div style={{ marginTop: "20px", padding: "15px",
          backgroundColor: "#f8f9fa", borderRadius: "8px",
          fontSize: "13px", color: "#555" }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: "bold", color: "#333" }}>
            Demo Credentials:
          </p>
          <p style={{ margin: "4px 0" }}>
            👑 <strong>Admin:</strong> admin / admin123
          </p>
          <p style={{ margin: "4px 0" }}>
            👤 <strong>Staff:</strong> staff / staff123
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;