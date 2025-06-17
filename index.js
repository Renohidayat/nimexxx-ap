const express = require('express');
const cors = require('cors');
const app = express();
const route = require("./src/router/route");
const { inject } = require("@vercel/analytics");

// Inject Vercel analytics (aman walau di Railway)
inject();

// Middleware
app.use(cors());
app.use(express.json());

// Logging request untuk debug
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
});

// Tes root langsung agar Railway tidak error 502
app.get("/", (req, res) => {
    res.send("✅ API Otakudesu is running!");
});

// Routing utama
app.use(route);

// Gunakan 0.0.0.0 untuk bisa diakses dari luar container
const port = process.env.PORT || 8000;

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server is running on http://localhost:${port}`);
});
