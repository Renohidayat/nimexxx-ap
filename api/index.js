const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");

// 🔥 FIX atob untuk Node.js
global.atob = (str) => Buffer.from(str, "base64").toString("utf-8");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// import routes
const route = require("../src/router/route");

// mount semua route di /api
app.use("/api", route);

// ❌ JANGAN ADA app.listen()

// ✅ export ke Vercel
module.exports = serverless(app);