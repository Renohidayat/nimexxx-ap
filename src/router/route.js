const express = require("express");
const router = express.Router();
const Services = require("../controller/services");
const fetch = require("node-fetch");

// Root endpoint info
router.get("/", (req, res) => {
  res.json({
    message: "Otakudesu API is running 🚀",
    version: "v1.0",
    endpoints: {
      getOngoingAnime: "/api/v1/ongoing/:page",
      getCompletedAnime: "/api/v1/completed/:page",
      getAnimeSearch: "/api/v1/search/:q",
      getAnimeList: "/api/v1/anime-list",
      getAnimeDetail: "/api/v1/detail/:endpoint",
      getAnimeEpisode: "/api/v1/episode/:endpoint",
      getBatchLink: "/api/v1/batch/:endpoint",
      getGenreList: "/api/v1/genres",
      getGenrePage: "/api/v1/genres/:genre/:page",
      getStreaming: "/api/v1/streaming/:content",
      proxyImage: "/api/v1/proxy-image?url={image_url}",
    },
  });
});

// Proxy image — supaya gambar tidak diblokir CORS di frontend
router.get("/api/v1/proxy-image", async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).json({ message: "Missing url param" });

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: "https://otakudesu.fit/",
      },
    });

    if (!response.ok)
      return res.status(response.status).json({ message: "Failed to fetch image" });

    res.set("Content-Type", response.headers.get("content-type"));
    res.set("Cache-Control", "public, max-age=86400"); // cache 1 hari
    response.body.pipe(res);
  } catch (error) {
    console.error("proxy-image error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API routes
router.get("/api/v1/ongoing/:page", Services.getOngoing);
router.get("/api/v1/completed/:page", Services.getCompleted);
router.get("/api/v1/search/:q", Services.getSearch);
router.get("/api/v1/anime-list", Services.getAnimeList);
router.get("/api/v1/detail/:endpoint", Services.getAnimeDetail);
router.get("/api/v1/episode/:endpoint", Services.getAnimeEpisode);
router.get("/api/v1/batch/:endpoint", Services.getBatchLink);
router.get("/api/v1/genres", Services.getGenreList);
router.get("/api/v1/genres/:genre/:page", Services.getGenrePage);
router.get("/api/v1/streaming/:content", Services.getEmbedByContent);

module.exports = router;