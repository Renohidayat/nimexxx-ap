const express = require("express");
const cors = require("cors");
const app = express();
const route = require("./src/router/route");

app.use(cors());
app.use(express.json());
app.use(route);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: false, message: "Something went wrong!" });
});

// 404 handler
app.all("*", (req, res) => {
  res.status(404).json({ status: false, message: "Endpoint Not Found" });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});

module.exports = app;