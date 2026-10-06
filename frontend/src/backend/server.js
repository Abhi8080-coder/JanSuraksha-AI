const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

// Import Report model
const Report = require("./models/report");

const app = express();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});
app.use(cors());


// Middleware
app.use(express.json());

// Check MongoDB URI
console.log("Mongo URI loaded:", !!process.env.MONGODB_URI);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error.message);
  });

// Home route
app.get("/", (req, res) => {
  res.send("JanSuraksha AI Backend is running");
});

app.post("/api/news-check", async (req, res) => {
  const { message } = req.body;

  console.log("NEWS CHECK API CALLED");
  console.log("News:", message);

  if (!message || !message.trim()) {
    return res.status(400).json({
      message: "Please provide a news claim.",
    });
  }

  try {
    console.log("Sending news to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are JanSuraksha AI, a public safety and misinformation awareness assistant.

Analyze the following news claim or information.

News claim:
${message}

Give a simple response for a normal user.

Include:

1. Risk level: LOW, MEDIUM, or HIGH
2. Why the claim may be misleading or suspicious
3. What the user should verify
4. Safety advice before sharing

Important:
Do not claim that information is definitely true or false unless there is sufficient evidence.
Explain that keyword-based or AI analysis cannot replace verification from reliable sources.`,
      config: {
        maxOutputTokens: 500,
      },
    });

    console.log("Gemini news response received");

    res.json({
      result: response.text,
    });

  } catch (error) {
    console.error("Gemini News error:", error);

    // FALLBACK NEWS CHECKER

    const suspiciousWords = [
      "shocking",
      "breaking",
      "100% true",
      "share immediately",
      "forward this",
      "secret",
      "guaranteed",
      "miracle",
      "viral",
      "government announced",
      "must share",
      "don't tell anyone",
      "forward immediately",
    ];

    const text = message.toLowerCase();

    const found = suspiciousWords.filter((word) =>
      text.includes(word)
    );

    let result;

    if (found.length >= 3) {
      result = `⚠️ HIGH RISK

This claim contains several warning indicators.

Suspicious indicators detected:
${found.join(", ")}

Verification steps:
• Check the original source.
• Check the publication date.
• Compare the claim with trusted news sources.
• Look for supporting evidence.
• Do not forward the claim immediately.

Note: Gemini AI was temporarily unavailable, so JanSuraksha AI used its built-in misinformation safety rules.`;

    } else if (found.length >= 1) {
      result = `⚠️ POSSIBLY MISLEADING

This claim contains some warning indicators.

Indicators detected:
${found.join(", ")}

Safety steps:
• Check the original source.
• Verify the date and author.
• Compare with reliable sources.
• Do not share until verified.

Note: Gemini AI was temporarily unavailable, so JanSuraksha AI used its built-in misinformation safety rules.`;

    } else {
      result = `🔎 NO OBVIOUS WARNING INDICATORS

No common misinformation warning words were detected.

However, this does NOT prove that the information is true.

Always verify important information using reliable and independent sources.

Note: Gemini AI was temporarily unavailable, so JanSuraksha AI used its built-in misinformation safety rules.`;
    }

    res.json({
      result: result,
      fallback: true,
    });
  }
});

// Submit Report API
app.post("/api/ai-safety", async (req, res) => {
  console.log("\n================ AI SAFETY API CALLED ================");

  const { message } = req.body;

  console.log("Message:", message);

  if (!message || !message.trim()) {
    return res.status(400).json({
      message: "Message is required"
    });
  }

  // Built-in scam detection rules
  const suspiciousWords = [
    "urgent",
    "click here",
    "verify account",
    "otp",
    "password",
    "winner",
    "won",
    "prize",
    "lottery",
    "bank account",
    "send money",
    "claim now",
    "free money",
    "kyc",
    "limited time",
    "registration fee",
    "registration fees",
    "pay",
    "earning",
    "per day",
    "limited seats",
    "activate your account"
  ];

  const text = message.toLowerCase();

  const found = suspiciousWords.filter((word) =>
    text.includes(word)
  );

  // Try Gemini first
  try {
    console.log("Sending message to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are JanSuraksha AI, a public safety assistant.

Analyze this message for possible online scams, fraud, suspicious links, misinformation, or safety risks.

Message:
${message}

Give a simple response for a normal user.

Include:
1. Risk level
2. Suspicious indicators
3. Why it may be suspicious
4. Safety steps

Do not claim certainty when information is insufficient.`
    });

    console.log("Gemini response received.");

    return res.json({
      result: response.text
    });

  } catch (error) {

    console.log("Gemini unavailable. Using built-in safety rules.");
    console.log("Gemini error:", error.message);

    // FALLBACK SYSTEM
    let riskLevel = "LOW RISK";

    if (found.length >= 3) {
      riskLevel = "HIGH RISK";
    } else if (found.length >= 1) {
      riskLevel = "POSSIBLY SUSPICIOUS";
    }

    const indicators =
      found.length > 0
        ? found.join(", ")
        : "No obvious suspicious indicators detected";

    const result = `
⚠️ ${riskLevel}

Suspicious indicators detected:
${indicators}

Safety steps:
• Do not click unknown links.
• Do not pay registration or processing fees.
• Never share OTP, PIN, passwords or banking details.
• Verify the sender through an official source.
• Do not make payments without proper verification.

Note: Gemini AI was temporarily unavailable, so JanSuraksha AI used its built-in safety rules.
`;

    return res.json({
      result: result.trim()
    });
  }
});

// Submit Public Issue Report API
app.post("/api/reports", async (req, res) => {
  console.log("\n================ REPORT API CALLED ================");
  console.log("Report data:", req.body);

  try {
    const { issue, location, description } = req.body;

    if (!issue || !location || !description) {
      return res.status(400).json({
        message: "Issue, location and description are required.",
      });
    }

    const newReport = new Report({
      issue,
      location,
      description,
    });

    const savedReport = await newReport.save();

    console.log("Report saved successfully:", savedReport._id);

    res.status(201).json({
      message: "Report submitted successfully",
      report: savedReport,
    });
  } catch (error) {
    console.error("Report submission error:", error);

    res.status(500).json({
      message: "Failed to save report",
      error: error.message,
    });
  }
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});