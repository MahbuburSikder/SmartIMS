import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>

      {/* Navbar */}
      <nav style={{
        backgroundColor: "#0a192f",
        color: "white",
        padding: "15px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2>SmartIMS</h2>

        <div>
          <span style={{ margin: "0 15px", cursor: "pointer" }}>Home</span>
          <span style={{ margin: "0 15px", cursor: "pointer" }}>Features</span>
          <span style={{ margin: "0 15px", cursor: "pointer" }}>About</span>
          <span style={{ margin: "0 15px", cursor: "pointer" }}>Contact</span>

          <button
          onClick={() => navigate("/login")}
            style={{
              marginLeft: "20px",
              padding: "8px 16px",
              backgroundColor: "#00bcd4",
              border: "none",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{
        background: "linear-gradient(to right, #0a192f, #112240)",
        color: "white",
        padding: "80px 20px",
        textAlign: "center"
      }}>
        <h1>Smart Cloud-Based Inventory Management System</h1>
        <p>
          Streamline inventory operations with real-time tracking,
          automated alerts, and data-driven insights.
        </p>

        <button
         onClick={() => navigate("/login")}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            backgroundColor: "#00bcd4",
            border: "none",
            color: "white",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Get Started
        </button>
      </header>

      {/* Features Section */}
      <section style={{
        padding: "50px 20px",
        backgroundColor: "#f5f5f5",
        textAlign: "center"
      }}>
        <h2>Key Features</h2>

        <div style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "30px",
          flexWrap: "wrap"
        }}>

          <div style={cardStyle}>
            <h3>📦 Real-Time Tracking</h3>
            <p>Monitor inventory levels instantly.</p>
          </div>

          <div style={cardStyle}>
            <h3>🔔 Automated Alerts</h3>
            <p>Receive notifications for low stock.</p>
          </div>

          <div style={cardStyle}>
            <h3>📊 Analytics Dashboard</h3>
            <p>Gain insights through reports.</p>
          </div>

          <div style={cardStyle}>
            <h3>☁ Cloud-Based Access</h3>
            <p>Access data securely from anywhere.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: "#0a192f",
        color: "white",
        padding: "15px",
        textAlign: "center"
      }}>
        <p>© {new Date().getFullYear()} SmartIMS | ATW306 Industry Project</p>
      </footer>

    </div>
  );
}

const cardStyle = {
  backgroundColor: "white",
  padding: "20px",
  margin: "10px",
  borderRadius: "10px",
  width: "250px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
};

export default Home;