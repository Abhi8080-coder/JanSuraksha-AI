import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [scamText, setScamText] = useState("");
  const [scamResult, setScamResult] = useState("");
  const [newsText, setNewsText] = useState("");
  const [newsResult, setNewsResult] = useState("");
  const [reports, setReports] = useState(
    JSON.parse(localStorage.getItem("janSurakshaReports")) || []
  );

  const services = [
    {
      icon: "🛡️",
      title: "Scam Detector",
      description: "Identify suspicious messages, links and online scams",
      page: "scam",
    },
    {
      icon: "📰",
      title: "Fake News Checker",
      description: "Learn how to identify misleading and fake information",
      page: "news",
    },
    {
      icon: "🚨",
      title: "Report Public Issues",
      description: "Report safety issues and problems in your local area",
      page: "report",
    },
    {
      icon: "📢",
      title: "Awareness Hub",
      description: "Learn about cyber safety, frauds and public awareness",
      page: "awareness",
    },
  ];

  // Scam detector
  
  const checkScam = async () => {
  if (!scamText.trim()) {
    setScamResult("Please enter a message or link.");
    return;
  }

  try {
    setScamResult("🔍 Analyzing message with JanSuraksha AI...");

    const response = await fetch("http://127.0.0.1:5000/api/ai-safety", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: scamText,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "AI analysis failed");
    }

    setScamResult(data.result);
  } catch (error) {
    console.error("Scam detector error:", error);

    setScamResult(
  "⚠️ Gemini AI is temporarily unavailable. JanSuraksha AI is using its built-in scam detection rules."
   );
  }
};

  // Fake news checker
  const checkNews = async () => {
  if (!newsText.trim()) {
    setNewsResult("Please enter the news or claim you want to check.");
    return;
  }

  try {
    setNewsResult("🔍 Analyzing information with JanSuraksha AI...");

    const response = await fetch(
      "http://127.0.0.1:5000/api/news-check",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newsText,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "News analysis failed");
    }

    setNewsResult(data.result);
  } catch (error) {
    console.error("News checker error:", error);

    setNewsResult(
      "❌ Unable to analyze the information. Please try again."
    );
  }
};

  // Report public issue
  const submitReport = async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);

  const newReport = {
    issue: form.get("issue"),
    location: form.get("location"),
    description: form.get("description")
  };

  try {
    const response = await fetch("http://localhost:5000/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newReport)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to submit report");
    }

    console.log("Report saved:", data);

    const reportForHistory = {
      id: Date.now(),
      issue: newReport.issue,
      location: newReport.location,
      description: newReport.description,
      date: new Date().toLocaleString()
    };

    const updatedReports = [...reports, reportForHistory];

    setReports(updatedReports);

    localStorage.setItem(
      "janSurakshaReports",
      JSON.stringify(updatedReports)
    );

    e.target.reset();

    alert("✅ Public issue reported successfully!");

    setPage("reports");

  } catch (error) {
    console.error("Report submission error:", error);

    alert("❌ Failed to submit report. Please try again.");
  }
};
  

  const goHome = () => {
    setPage("home");
    window.scrollTo(0, 0);
  };

  // HOME
  if (page === "home") {
    return (
      <div className="app">
        <header className="navbar">
          <div className="logo" onClick={goHome}>
            🛡️ JanSuraksha AI
          </div>

          <button className="nav-home" onClick={goHome}>
            Home
          </button>
        </header>

        <main>
          <section className="hero">
            <div className="hero-content">
              <span className="badge">SMART PUBLIC SAFETY PLATFORM</span>

              <h1>Protect Yourself From Digital Threats</h1>

              <p>
                JanSuraksha AI helps citizens identify online scams, understand
                misinformation, report public safety issues and improve
                awareness.
              </p>

              <button
                className="primary-btn"
                onClick={() => {
                  document
                    .getElementById("services")
                    .scrollIntoView({ behavior: "smooth" });
                }}
              >
                Get Started
              </button>
            </div>
          </section>

          <section id="services" className="services">
            <h2>Our Safety Services</h2>

            <p className="section-subtitle">
              Choose a service to protect yourself and your community.
            </p>

            <div className="cards">
              {services.map((service) => (
                <div className="card" key={service.title}>
                  <div className="icon">{service.icon}</div>

                  <h3>{service.title}</h3>

                  <p>{service.description}</p>

                  <button
                    className="card-btn"
                    onClick={() => setPage(service.page)}
                  >
                    Open Service →
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="quick-info">
            <h2>Stay Safe Online</h2>

            <div className="info-grid">
              <div>
                <span>🔐</span>
                <h3>Protect Your Password</h3>
                <p>Never share passwords or OTPs with anyone.</p>
              </div>

              <div>
                <span>🔗</span>
                <h3>Check Links</h3>
                <p>Avoid clicking unknown or suspicious links.</p>
              </div>

              <div>
                <span>📱</span>
                <h3>Think Before Sharing</h3>
                <p>Verify information before forwarding it.</p>
              </div>
            </div>
          </section>
        </main>

        <footer>
          <p>© 2026 JanSuraksha AI | Smart Public Safety & Awareness Platform</p>
        </footer>
      </div>
    );
  }

  // SCAM DETECTOR
  if (page === "scam") {
    return (
      <div className="page">
        <button className="back-btn" onClick={goHome}>
          ← Back to Home
        </button>

        <div className="tool-container">
          <div className="tool-icon">🛡️</div>

          <h1>Scam Detector</h1>

          <p>
            Enter a suspicious message, SMS, email or link to check for common
            scam indicators.
          </p>

          <textarea
            placeholder="Example: Congratulations! You won a prize. Click here and verify your account..."
            value={scamText}
            onChange={(e) => setScamText(e.target.value)}
          />

          <button className="primary-btn" onClick={checkScam}>
            Check for Scam
          </button>

          {scamResult && <div className="result">{scamResult}</div>}

          <div className="warning-box">
            <h3>⚠️ Never share</h3>
            <ul>
              <li>OTP</li>
              <li>ATM / UPI PIN</li>
              <li>Passwords</li>
              <li>Banking information</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // FAKE NEWS CHECKER
  if (page === "news") {
    return (
      <div className="page">
        <button className="back-btn" onClick={goHome}>
          ← Back to Home
        </button>

        <div className="tool-container">
          <div className="tool-icon">📰</div>

          <h1>Fake News Checker</h1>

          <p>
            Enter a news claim and learn about common signs of misleading
            information.
          </p>

          <textarea
            placeholder="Enter the news or claim here..."
            value={newsText}
            onChange={(e) => setNewsText(e.target.value)}
          />

          <button className="primary-btn" onClick={checkNews}>
            Check Information
          </button>

          {newsResult && <div className="result">{newsResult}</div>}

          <div className="tips">
            <h3>How to identify fake news?</h3>

            <div className="tip">
              <b>1. Check the source</b>
              <p>Use reliable and trustworthy websites.</p>
            </div>

            <div className="tip">
              <b>2. Check the date</b>
              <p>Old information may be shared as new information.</p>
            </div>

            <div className="tip">
              <b>3. Compare sources</b>
              <p>Look for the same information from multiple sources.</p>
            </div>

            <div className="tip">
              <b>4. Don't forward immediately</b>
              <p>Verify before sharing information with others.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REPORT PAGE
  if (page === "report") {
    return (
      <div className="page">
        <button className="back-btn" onClick={goHome}>
          ← Back to Home
        </button>

        <div className="tool-container">
          <div className="tool-icon">🚨</div>

          <h1>Report Public Issues</h1>

          <p>
            Report safety problems or public issues in your local area.
          </p>

          <form onSubmit={submitReport}>
            <label>Issue Type</label>

            <select name="issue" required>
              <option value="">Select issue</option>
              <option>Road Damage</option>
              <option>Street Light Problem</option>
              <option>Garbage / Cleanliness</option>
              <option>Water Supply Problem</option>
              <option>Traffic Problem</option>
              <option>Public Safety Issue</option>
              <option>Other</option>
            </select>

            <label>Location</label>

            <input
              type="text"
              name="location"
              placeholder="Enter location"
              required
            />

            <label>Description</label>

            <textarea
              name="description"
              placeholder="Describe the problem..."
              required
            ></textarea>

            <button className="primary-btn" type="submit">
              Submit Report
            </button>
          </form>

          <button
            className="secondary-btn"
            onClick={() => setPage("reports")}
          >
            View Submitted Reports
          </button>
        </div>
      </div>
    );
  }

  // REPORT HISTORY
  if (page === "reports") {
    return (
      <div className="page">
        <button className="back-btn" onClick={goHome}>
          ← Back to Home
        </button>

        <div className="tool-container wide">
          <div className="tool-icon">📋</div>

          <h1>Submitted Reports</h1>

          {reports.length === 0 ? (
            <div className="empty">
              <h3>No reports submitted yet.</h3>
              <p>Your submitted public issues will appear here.</p>
            </div>
          ) : (
            <div className="reports">
              {reports.map((report) => (
                <div className="report-card" key={report.id}>
                  <h3>{report.issue}</h3>
                  <p>
                    <b>📍 Location:</b> {report.location}
                  </p>
                  <p>
                    <b>📝 Description:</b> {report.description}
                  </p>
                  <small>Reported: {report.date}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // AWARENESS HUB
  if (page === "awareness") {
    return (
      <div className="page">
        <button className="back-btn" onClick={goHome}>
          ← Back to Home
        </button>

        <div className="tool-container wide">
          <div className="tool-icon">📢</div>

          <h1>Awareness Hub</h1>

          <p>
            Learn simple safety practices for digital and public environments.
          </p>

          <div className="awareness-grid">
            <div className="awareness-card">
              <span>🔐</span>
              <h3>Cyber Safety</h3>
              <p>
                Use strong passwords and enable two-factor authentication.
                Never share your OTP or PIN.
              </p>
            </div>

            <div className="awareness-card">
              <span>💳</span>
              <h3>Online Payment Safety</h3>
              <p>
                Verify the receiver before making payments. Remember that UPI
                PIN is required to send money, not receive it.
              </p>
            </div>

            <div className="awareness-card">
              <span>🎣</span>
              <h3>Phishing Awareness</h3>
              <p>
                Do not open suspicious links or provide personal information
                through unknown websites.
              </p>
            </div>

            <div className="awareness-card">
              <span>📢</span>
              <h3>Fake News Awareness</h3>
              <p>
                Check the source, date and evidence before forwarding news on
                social media.
              </p>
            </div>

            <div className="awareness-card">
              <span>🚨</span>
              <h3>Public Safety</h3>
              <p>
                Report damaged roads, unsafe locations, broken street lights
                and other public safety concerns.
              </p>
            </div>

            <div className="awareness-card">
              <span>👨‍👩‍👧</span>
              <h3>Family Safety</h3>
              <p>
                Educate children and family members about online scams,
                privacy and responsible internet use.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;