const express = require("express");
const router = express.Router();
const Services = require("../controller/services");

// =====================
// ROOT (FIX: wajib return)
// =====================
router.get("/", (req, res) => {
    console.log("Root endpoint accessed");
    return res.json({
        status: true,
        message: "API nimexxx-ap jalan 🚀",
        endpoints: {
            ongoing: "/api/v1/ongoing/:page",
            completed: "/api/v1/completed/:page",
            search: "/api/v1/search/:q",
            animeList: "/api/v1/anime-list",
            detail: "/api/v1/detail/:endpoint",
            episode: "/api/v1/episode/:endpoint",
            batch: "/api/v1/batch/:endpoint",
            genres: "/api/v1/genres",
            genrePage: "/api/v1/genres/:genre/:page",
            streaming: "/api/v1/streaming/:content"
        }
    });
});

// =====================
// API ROUTES (FIX: TANPA /api prefix)
// =====================
router.get("/v1/ongoing/:page", Services.getOngoing);
router.get("/v1/completed/:page", Services.getCompleted);
router.get("/v1/search/:q", Services.getSearch);
router.get("/v1/anime-list", Services.getAnimeList);
router.get("/v1/detail/:endpoint", Services.getAnimeDetail);
router.get("/v1/episode/:endpoint", Services.getAnimeEpisode);
router.get("/v1/batch/:endpoint", Services.getBatchLink);
router.get("/v1/genres", Services.getGenreList);
router.get("/v1/genres/:genre/:page", Services.getGenrePage);
router.get("/v1/streaming/:content", Services.getEmbedByContent);

// =====================
// PROXY IMAGE (FIX STREAM)
// =====================
router.get("/v1/proxy-image", async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            return res.status(400).json({ message: "Missing url param" });
        }

        const response = await fetch(imageUrl);

        if (!response.ok) {
            return res.status(response.status).json({
                message: "Failed to fetch image"
            });
        }

        res.setHeader("Content-Type", response.headers.get("content-type"));
        return response.body.pipe(res);
    } catch (error) {
        console.error("Proxy error:", error.message);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// =====================
// 404 HANDLER (PENTING BIAR GA LOADING)
// =====================
router.use((req, res) => {
    return res.status(404).json({
        status: false,
        message: "Route not found"
    });
});

module.exports = router;