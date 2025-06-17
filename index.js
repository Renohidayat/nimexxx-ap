const express = require('express');
const cors = require('cors');
const app = express();
const route = require("./src/router/route")
const { inject } = require("@vercel/analytics")

inject();

app.use(cors());
app.use(route)
const port = process.env.PORT || 8000;

console.log("PORT dari env:", process.env.PORT);
console.log("Port yang digunakan:", port);

app.listen(port, () => {
    try {
        console.log(`Running on localhost:${port}`);
    } catch (error) {
        throw error;
    }
});
