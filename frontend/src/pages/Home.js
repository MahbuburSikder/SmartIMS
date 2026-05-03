import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>

      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: "#0d1b2a",
        padding: "15px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <h2 style={{ color: "white", margin: 0 }}>SmartIMS</h2>
        <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
          <a href="#home" style={{ color: "white", textDecoration: "none",
            fontSize: "15px" }}>Home</a>
          <a href="#features" style={{ color: "white", textDecoration: "none",
            fontSize: "15px" }}>Features</a>
          <a href="#about" style={{ color: "white", textDecoration: "none",
            fontSize: "15px" }}>About</a>
          <a href="#contact" style={{ color: "white", textDecoration: "none",
            fontSize: "15px" }}>Contact</a>
          <button onClick={() => navigate("/login")}
            style={{
              backgroundColor: "#00bcd4", color: "white", border: "none",
              padding: "8px 20px", borderRadius: "5px", cursor: "pointer",
              fontWeight: "bold", fontSize: "15px"
            }}>
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={{
        backgroundColor: "#0d1b2a",
        padding: "100px 40px",
        textAlign: "center"
      }}>
        <h1 style={{ color: "white", fontSize: "36px", marginBottom: "20px" }}>
          Smart Cloud-Based Inventory Management System
        </h1>
        <p style={{ color: "#ccc", fontSize: "18px", marginBottom: "40px" }}>
          Streamline inventory operations with real-time tracking,
          automated alerts, and data-driven insights.
        </p>
        <button onClick={() => navigate("/login")}
          style={{
            backgroundColor: "#00bcd4", color: "white", border: "none",
            padding: "15px 40px", borderRadius: "8px", cursor: "pointer",
            fontSize: "18px", fontWeight: "bold"
          }}>
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: "80px 40px",
        backgroundColor: "#f0f2f5",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#0d1b2a", fontSize: "32px", marginBottom: "10px" }}>
          Key Features
        </h2>
        <p style={{ color: "#666", marginBottom: "50px", fontSize: "16px" }}>
          Everything your business needs to manage inventory efficiently
        </p>

        <div style={{ display: "flex", gap: "25px", justifyContent: "center",
          flexWrap: "wrap" }}>

          {[
            {
              icon: "📦",
              title: "Real-Time Tracking",
              desc: "Monitor inventory levels instantly with live data synchronisation across all devices and locations."
            },
            {
              icon: "🔔",
              title: "Automated Alerts",
              desc: "Receive automatic notifications when stock falls below minimum thresholds to prevent stockouts."
            },
            {
              icon: "📊",
              title: "Analytics Dashboard",
              desc: "Gain deep insights through comprehensive reports, forecasts and demand analysis tools."
            },
            {
              icon: "☁️",
              title: "Cloud-Based Access",
              desc: "Access your inventory data securely from anywhere, on any device, at any time."
            },
            {
              icon: "🔒",
              title: "Role-Based Access",
              desc: "Control who can view or modify inventory with Admin and Staff permission levels."
            },
            {
              icon: "🔄",
              title: "Auto Replenishment",
              desc: "Automatically generate reorder requests when stock runs low to keep supply chain moving."
            }
          ].map((feature, index) => (
            <div key={index} style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "30px 25px",
              width: "280px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              textAlign: "left"
            }}>
              <div style={{ fontSize: "36px", marginBottom: "15px" }}>
                {feature.icon}
              </div>
              <h3 style={{ color: "#0d1b2a", marginBottom: "10px" }}>
                {feature.title}
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6", fontSize: "14px" }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{
        padding: "80px 40px",
        backgroundColor: "white",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#0d1b2a", fontSize: "32px", marginBottom: "20px" }}>
          About SmartIMS
        </h2>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.8",
            marginBottom: "20px" }}>
            SmartIMS is a cloud-native Inventory Management System designed
            specifically for small-to-medium enterprises (SMEs) that need a
            powerful, affordable alternative to expensive off-the-shelf software.
          </p>
          <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.8",
            marginBottom: "20px" }}>
            Built using a modern microservices architecture with React.js on the
            frontend and Node.js with Express on the backend, SmartIMS delivers
            enterprise-grade inventory management at zero licensing cost.
          </p>
          <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.8",
            marginBottom: "40px" }}>
            Our system eliminates the inefficiencies of manual spreadsheet-based
            tracking by providing real-time visibility, automated alerts, and
            data-driven forecasting tools that help businesses make smarter
            decisions.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: "40px", justifyContent: "center",
            flexWrap: "wrap" }}>
            {[
              { number: "100%", label: "Open Source" },
              { number: "24/7", label: "Cloud Access" },
              { number: "0$", label: "Licensing Cost" },
              { number: "99.9%", label: "Uptime SLA" }
            ].map((stat, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                <h2 style={{ color: "#00bcd4", fontSize: "36px", margin: 0 }}>
                  {stat.number}
                </h2>
                <p style={{ color: "#666", margin: "5px 0" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section style={{
        padding: "60px 40px",
        backgroundColor: "#f0f2f5",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#0d1b2a", fontSize: "28px", marginBottom: "40px" }}>
          Built With Modern Technology
        </h2>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center",
          flexWrap: "wrap" }}>
          {[
            { name: "React.js", desc: "Frontend UI" },
            { name: "Node.js", desc: "Backend Runtime" },
            { name: "Express.js", desc: "API Framework" },
            { name: "PostgreSQL", desc: "Database" },
            { name: "Render", desc: "Cloud Hosting" },
            { name: "GitHub", desc: "Version Control" }
          ].map((tech, index) => (
            <div key={index} style={{
              backgroundColor: "white", borderRadius: "8px",
              padding: "20px 25px", minWidth: "130px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}>
              <h4 style={{ color: "#0d1b2a", margin: "0 0 5px 0" }}>
                {tech.name}
              </h4>
              <p style={{ color: "#666", margin: 0, fontSize: "13px" }}>
                {tech.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{
        padding: "80px 40px",
        backgroundColor: "white",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#0d1b2a", fontSize: "32px", marginBottom: "10px" }}>
          Contact Us
        </h2>
        <p style={{ color: "#666", marginBottom: "50px", fontSize: "16px" }}>
          Get in touch with our team for support or enquiries
        </p>

        <div style={{ display: "flex", gap: "30px", justifyContent: "center",
          flexWrap: "wrap" }}>
          {[
            {
              icon: "👤",
              name: "Mahbubur Rahman Sikder",
              role: "Project Lead & Backend Developer",
              email: "Mahbubur.sikder@student.torrens.edu.au"
            },
            {
              icon: "👤",
              name: "Sampada Subedi",
              role: "Frontend Developer & QA Lead",
              email: "Sampada.subedi@student.torrens.edu.au"
            },
            {
              icon: "👤",
              name: "Uddhav Shrestha",
              role: "DevOps Engineer & Integration Specialist",
              email: "Uddhav.shrestha@student.torrens.edu.au"
            }
          ].map((member, index) => (
            <div key={index} style={{
              backgroundColor: "#f0f2f5", borderRadius: "12px",
              padding: "30px 25px", width: "280px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>
                {member.icon}
              </div>
              <h3 style={{ color: "#0d1b2a", marginBottom: "8px",
                fontSize: "16px" }}>
                {member.name}
              </h3>
              <p style={{ color: "#00bcd4", marginBottom: "10px",
                fontSize: "13px", fontWeight: "bold" }}>
                {member.role}
              </p>
              <p style={{ color: "#666", fontSize: "13px" }}>
                {member.email}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: "#0d1b2a",
        padding: "30px 40px",
        textAlign: "center"
      }}>
        <p style={{ color: "#ccc", margin: 0 }}>
          © 2026 SmartIMS | ATW306 Industry Project | Torrens University Australia
        </p>
      </footer>

    </div>
  );
}

export default Home;