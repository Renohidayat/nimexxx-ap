const services = require("../helper/sevice");
const cheerio = require("cheerio");
const baseUrl = require("../constant/url");
const episodeHelper = require("../helper/episodeHelper");

const Services = {
  // GET /api/v1/ongoing/:page
  getOngoing: async (req, res) => {
    const page = req.params.page;
    const url =
      page == 1
        ? `${baseUrl}/ongoing-anime/`
        : `${baseUrl}/ongoing-anime/page/${page}/`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      const $ = cheerio.load(response.data);
      const ongoing = [];

      $(".listupd article.bs").each((i, el) => {
        const href = $(el).find("a").attr("href") || "";
        ongoing.push({
          title: $(el).find(".tt h2").text().trim() || $(el).find("a").attr("title"),
          thumb: $(el).find("img").attr("src"),
          total_episode: $(el).find(".epx").text().trim(),
          endpoint: href.replace(`${baseUrl}/series/`, "").replace(/\//g, ""),
        });
      });

      return res.status(200).json({ status: true, message: "success", ongoing, currentPage: page });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).json({ status: false, message: error.message, ongoing: [] });
    }
  },

  // GET /api/v1/completed/:page
  getCompleted: async (req, res) => {
    const page = req.params.page;
    const url =
      page == 1
        ? `${baseUrl}/complete-anime/`
        : `${baseUrl}/complete-anime/page/${page}/`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      const $ = cheerio.load(response.data);
      const completed = [];

      $(".listupd article.bs").each((i, el) => {
        const href = $(el).find("a").attr("href") || "";
        completed.push({
          title: $(el).find(".tt h2").text().trim() || $(el).find("a").attr("title"),
          thumb: $(el).find("img").attr("src"),
          total_episode: $(el).find(".epx").text().trim(),
          endpoint: href.replace(`${baseUrl}/series/`, "").replace(/\//g, ""),
        });
      });

      return res.status(200).json({ status: true, message: "success", completed, currentPage: page });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).json({ status: false, message: error.message, completed: [] });
    }
  },

  // GET /api/v1/search/:q
  getSearch: async (req, res) => {
    const query = req.params.q;
    const url = `${baseUrl}/?s=${query}&post_type=anime`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      const $ = cheerio.load(response.data);
      const search = [];

      $(".listupd article.bs").each((i, el) => {
        const href = $(el).find("a").attr("href") || "";
        search.push({
          title: $(el).find(".tt h2").text().trim() || $(el).find("a").attr("title"),
          thumb: $(el).find("img").attr("src"),
          endpoint: href.replace(`${baseUrl}/series/`, "").replace(/\//g, ""),
        });
      });

      return res.status(200).json({ status: true, message: "success", search, query });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).json({ status: false, message: error.message, search: [] });
    }
  },

  // GET /api/v1/anime-list
  getAnimeList: async (req, res) => {
    const url = `${baseUrl}/anime-list/`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      const $ = cheerio.load(response.data);
      const anime_list = [];

      $(".soralist a.series").each((i, el) => {
        const href = $(el).attr("href") || "";
        const title = $(el).text().trim();
        if (title) {
          anime_list.push({
            title,
            endpoint: href.replace(`${baseUrl}/series/`, "").replace(/\//g, ""),
          });
        }
      });

      return res.status(200).json({ status: true, message: "success", anime_list });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).json({ status: false, message: error.message, anime_list: [] });
    }
  },

  // GET /api/v1/detail/:endpoint
  getAnimeDetail: async (req, res) => {
    const endpoint = req.params.endpoint;
    const url = `${baseUrl}/series/${endpoint}/`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      const $ = cheerio.load(response.data);
      const anime_detail = {};
      const episode_list = [];

      // Thumb & info
      anime_detail.title = $(".entry-title").first().text().trim() ||
                           $("h1.entry-title").text().trim() ||
                           $(".infox h1").text().trim();
      anime_detail.thumb = $(".thumb img").attr("src") ||
                           $(".thumbook img").attr("src");

      // Synopsis
      const sinopsis = [];
      $(".entry-content p, .synp p").each((i, el) => sinopsis.push($(el).text().trim()));
      anime_detail.sinopsis = sinopsis;

      // Detail info
      const detail = [];
      $(".infox .spe span, .infox span").each((i, el) => detail.push($(el).text().trim()));
      anime_detail.detail = detail;

      // Episode list — new site uses /episode/ path
      $(".eplister ul li, .episodelist ul li").each((i, el) => {
        const a = $(el).find("a");
        const href = a.attr("href") || "";
        episode_list.push({
          episode_title: a.find(".epl-title").text().trim() || a.text().trim(),
          episode_date: $(el).find(".epl-date").text().trim(),
          episode_endpoint: href
            .replace(`${baseUrl}/episode/`, "")
            .replace(`${baseUrl}/batch/`, "")
            .replace(/\//g, ""),
        });
      });

      return res.status(200).json({
        status: true,
        message: "success",
        anime_detail,
        episode_list,
        endpoint,
      });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).json({ status: false, message: error.message, anime_detail: {}, episode_list: [] });
    }
  },

  // GET /api/v1/episode/:endpoint
  getAnimeEpisode: async (req, res) => {
    const endpoint = req.params.endpoint;
    const url = `${baseUrl}/episode/${endpoint}/`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      const $ = cheerio.load(response.data);
      const obj = {};

      obj.title = $(".entry-title, .cat-series").first().text().trim();
      obj.baseUrl = url;
      obj.id = endpoint;

      // Stream embed
      obj.streamLink = $(".main-video iframe, #lightsVideo iframe, .player-embed iframe").first().attr("src") || null;

      // Mirror streams
      const streaming1 = [], streaming2 = [], streaming3 = [];

      $(".mirrorstream .m360p li, ul.m360p li").each((k, v) => {
        streaming1.push({ driver: $(v).text().trim(), link: "/api/v1/streaming/" + $(v).find("a").data()?.content });
      });
      $(".mirrorstream .m480p li, ul.m480p li").each((k, v) => {
        streaming2.push({ driver: $(v).text().trim(), link: "/api/v1/streaming/" + $(v).find("a").data()?.content });
      });
      $(".mirrorstream .m720p li, ul.m720p li").each((k, v) => {
        streaming3.push({ driver: $(v).text().trim(), link: "/api/v1/streaming/" + $(v).find("a").data()?.content });
      });

      obj.mirror_embed1 = { quality: "360p", streaming: streaming1 };
      obj.mirror_embed2 = { quality: "480p", streaming: streaming2 };
      obj.mirror_embed3 = { quality: "720p", streaming: streaming3 };

      // Download links
      const download = [];
      $(".dlpost ul li, .download ul li").each((i, el) => {
        const quality = $(el).find("strong").text().trim();
        const size = $(el).find("i").text().trim();
        const links = [];
        $(el).find("a").each((j, a) => {
          links.push({ host: $(a).text().trim(), link: $(a).attr("href") });
        });
        if (quality) download.push({ quality, size, links });
      });
      obj.download = download;

      // Navigation
      obj.relative = [];
      $(".navepsingle a, .flir a").each((i, el) => {
        const href = $(el).attr("href") || "";
        obj.relative.push({
          title_ref: $(el).text().trim(),
          link_ref: href.replace(`${baseUrl}/episode/`, "").replace(/\//g, ""),
        });
      });

      res.send(obj);
    } catch (err) {
      if (!res.headersSent)
        res.status(500).json({ status: false, message: err.message });
    }
  },

  // GET /api/v1/batch/:endpoint
  getBatchLink: async (req, res) => {
    const endpoint = req.params.endpoint;
    const fullUrl = `${baseUrl}/batch/${endpoint}/`;

    try {
      const response = await services.fetchService(fullUrl, res);
      if (!response || res.headersSent) return;

      const $ = cheerio.load(response.data);
      const batch = {};
      batch.title = $(".entry-title").first().text().trim();
      batch.baseUrl = fullUrl;

      const download_list = [];
      $(".batchlink ul li, .dlpost ul li").each((i, el) => {
        const quality = $(el).find("strong").text().trim();
        const size = $(el).find("i").text().trim();
        const links = [];
        $(el).find("a").each((j, a) => {
          links.push({ host: $(a).text().trim(), link: $(a).attr("href") });
        });
        if (quality) download_list.push({ quality, size, links });
      });
      batch.download_list = download_list;

      res.send({ status: true, message: "success", batch });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).json({ status: false, message: error.message });
    }
  },

  // GET /api/v1/genres
  getGenreList: async (req, res) => {
    const url = `${baseUrl}/genre-list/`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      const $ = cheerio.load(response.data);
      const genres = [];

      // New structure: <li><a href="/genres/action/"><span class="name">Action</span><span class="count">259</span></a></li>
      $(".postbody li a, .genrelist li a").each((i, el) => {
        const href = $(el).attr("href") || "";
        if (!href.includes("/genres/")) return;
        genres.push({
          genre: $(el).find(".name").text().trim() || $(el).text().trim(),
          count: $(el).find(".count").text().trim(),
          endpoint: href.replace(`${baseUrl}/genres/`, "").replace(/\//g, ""),
        });
      });

      return res.status(200).json({ status: true, message: "success", genres });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).json({ status: false, message: error.message, genres: [] });
    }
  },

  // GET /api/v1/genres/:genre/:page
  getGenrePage: async (req, res) => {
    const genre = req.params.genre;
    const page = req.params.page;
    const url =
      page == 1
        ? `${baseUrl}/genres/${genre}/`
        : `${baseUrl}/genres/${genre}/page/${page}/`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      const $ = cheerio.load(response.data);
      const genreAnime = [];

      $(".listupd article.bs").each((i, el) => {
        const href = $(el).find("a").attr("href") || "";
        genreAnime.push({
          title: $(el).find(".tt h2").text().trim() || $(el).find("a").attr("title"),
          thumb: $(el).find("img").attr("src"),
          endpoint: href.replace(`${baseUrl}/series/`, "").replace(/\//g, ""),
        });
      });

      return res.status(200).json({ status: true, message: "success", genreAnime });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).json({ status: false, message: error.message, genreAnime: [] });
    }
  },

  // GET /api/v1/streaming/:content
  getEmbedByContent: async (req, res) => {
    try {
      const nonce = await episodeHelper.getNonce();
      const content = req.params.content;
      const html_streaming = await episodeHelper.getUrlAjax(content, nonce);
      if (!html_streaming) return res.status(500).json({ status: false, message: "Failed to get stream" });

      const $ = cheerio.load(html_streaming);
      const link = $("iframe").attr("src");
      res.send({ streaming_url: link || null });
    } catch (err) {
      if (!res.headersSent)
        res.status(500).json({ status: false, message: err.message });
    }
  },
};

module.exports = Services;