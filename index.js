const express = require('express');
const cors = require('cors');
const app = express();
const route = require("./src/router/route");
const { inject } = require("@vercel/analytics");

inject();

// Middleware
app.use(cors());
app.use(express.json()); // Jika kamu menerima body JSON
app.use(route);

// Port
const port = process.env.PORT || 8000;

// Log untuk debug
console.log("PORT dari env:", process.env.PORT);
console.log("Port yang digunakan:", port);

// Mulai server
app.listen(port, () => {
    console.log(`✅ Server is running on http://localhost:${port}`);
});
