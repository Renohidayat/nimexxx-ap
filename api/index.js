const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");

// 🔥 FIX atob untuk Node.js (penting!)
global.atob = (str) => Buffer.from(str, "base64").toString("utf-8");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// import routes
const route = require("../src/router/route");
app.use("/", route);

// test endpoint (biar ga 404 root)
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "API nimexxx-ap jalan 🚀",
  });
});

// ❌ JANGAN ADA app.listen()

// ✅ export ke Vercel
module.exports = serverless(app);