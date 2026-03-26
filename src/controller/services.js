const services = require("../helper/sevice");
const cheerio = require("cheerio");
const baseUrl = require("../constant/url");
const episodeHelper = require("../helper/episodeHelper");

const Services = {
  getOngoing: async (req, res) => {
    const page = req.params.page;
    const url =
      page == 1
        ? `${baseUrl}/ongoing-anime/`
        : `${baseUrl}/ongoing-anime/page/${page}/`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const element = $(".rapi");
        const ongoing = [];

        element.find("ul > li").each((index, el) => {
          const endpoint = $(el).find(".thumb > a").attr("href") || "";
          ongoing.push({
            title: $(el).find("h2").text().trim(),
            thumb: $(el).find("img").attr("src"),
            total_episode: $(el).find(".epz").text(),
            updated_on: $(el).find(".newnime").text(),
            updated_day: $(el).find(".epztipe").text(),
            endpoint: endpoint.replace(`${baseUrl}/anime/`, "").replace(/\//g, ""),
          });
        });

        return res.status(200).json({
          status: true,
          message: "success",
          ongoing,
          currentPage: page,
        });
      }

      return res.send({ message: response.status, ongoing: [] });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).send({ status: false, message: error.message, ongoing: [] });
    }
  },

  getCompleted: async (req, res) => {
    const page = req.params.page;
    const url =
      page == 1
        ? `${baseUrl}/complete-anime/`
        : `${baseUrl}/complete-anime/page/${page}/`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const element = $(".rapi");
        const completed = [];

        element.find("ul > li").each((index, el) => {
          const endpoint = $(el).find(".thumb > a").attr("href") || "";
          completed.push({
            title: $(el).find("h2").text().trim(),
            thumb: $(el).find("img").attr("src"),
            total_episode: $(el).find(".epz").text(),
            updated_on: $(el).find(".newnime").text(),
            score: $(el).find(".epztipe").text().trim(),
            endpoint: endpoint.replace(`${baseUrl}/anime/`, "").replace(/\//g, ""),
          });
        });

        return res.status(200).json({
          status: true,
          message: "success",
          completed,
          currentPage: page,
        });
      }

      return res.send({ status: response.status, completed: [] });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).send({ status: false, message: error.message, completed: [] });
    }
  },

  getSearch: async (req, res) => {
    const query = req.params.q;
    const url = `${baseUrl}/?s=${query}&post_type=anime`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const element = $(".page");
        const search = [];

        element.find("li").each((index, el) => {
          const href = $(el).find("h2 > a").attr("href") || "";
          search.push({
            title: $(el).find("h2 > a").text(),
            thumb: $(el).find("img").attr("src"),
            genres: $(el).find(".set > a").text().match(/[A-Z][a-z]+/g),
            status:
              $(el).find(".set").text().match("Ongoing") ||
              $(el).find(".set").text().match("Completed"),
            rating: $(el).find(".set").text().replace(/^\D+/g, "") || null,
            endpoint: href.replace(`${baseUrl}/anime/`, "").replace(/\//g, ""),
          });
        });

        return res.status(200).json({
          status: true,
          message: "success",
          search,
          query,
        });
      }

      return res.send({ message: response.status, search: [] });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).send({ status: false, message: error.message, search: [] });
    }
  },

  getAnimeList: async (req, res) => {
    const url = `${baseUrl}/anime-list/`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const element = $("#abtext");
        const anime_list = [];

        element.find(".jdlbar").each((index, el) => {
          const title = $(el).find("a").text() || null;
          const href = $(el).find("a").attr("href") || "";
          anime_list.push({
            title,
            endpoint: href.replace(`${baseUrl}/anime/`, ""),
          });
        });

        const datas = anime_list.filter((v) => v.title !== null);

        return res.status(200).json({
          status: true,
          message: "success",
          anime_list: datas,
        });
      }

      return res.send({ message: response.status, anime_list: [] });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).send({ status: false, message: error.message, anime_list: [] });
    }
  },

  getAnimeDetail: async (req, res) => {
    const endpoint = req.params.endpoint;
    const url = `${baseUrl}/anime/${endpoint}/`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const infoElement = $(".fotoanime");
        const episodeElement = $(".episodelist");
        const anime_detail = {};
        const episode_list = [];
        const sinopsis = [];
        const detail = [];

        infoElement.each((index, el) => {
          anime_detail.thumb = $(el).find("img").attr("src");
          $(el)
            .find(".sinopc > p")
            .each((i, p) => sinopsis.push($(p).text()));
          $(el)
            .find(".infozingle > p")
            .each((i, p) => detail.push($(p).text()));
          anime_detail.sinopsis = sinopsis;
          anime_detail.detail = detail;
        });

        anime_detail.title = $(".jdlrx > h1").text();

        episodeElement.find("li").each((index, el) => {
          const href = $(el).find("span > a").attr("href") || "";
          episode_list.push({
            episode_title: $(el).find("span > a").text(),
            episode_endpoint: href
              .replace(`${baseUrl}/episode/`, "")
              .replace(`${baseUrl}/batch/`, "")
              .replace(`${baseUrl}/lengkap/`, "")
              .replace(/\//g, ""),
            episode_date: $(el).find(".zeebr").text(),
          });
        });

        return res.status(200).json({
          status: true,
          message: "success",
          anime_detail,
          episode_list,
          endpoint,
        });
      }

      return res.send({
        message: response.status,
        anime_detail: [],
        episode_list: [],
      });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).send({
          status: false,
          message: error.message,
          anime_detail: [],
          episode_list: [],
        });
    }
  },

  getEmbedByContent: async (req, res) => {
    try {
      const nonce = await episodeHelper.getNonce();
      const content = req.params.content;
      const html_streaming = await episodeHelper.getUrlAjax(content, nonce);
      const parse = cheerio.load(html_streaming);
      const link = parse("iframe").attr("src");

      res.send({ streaming_url: link || null });
    } catch (err) {
      console.error(err);
      if (!res.headersSent)
        res.status(500).send({ status: false, message: err.message });
    }
  },

  getAnimeEpisode: async (req, res) => {
    const endpoint = req.params.endpoint;
    const url = `${baseUrl}/episode/${endpoint}`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      const $ = cheerio.load(response.data);
      const streamElement = $("#lightsVideo").find("#embed_holder");
      const obj = {};

      obj.title = $(".venutama > h1").text();
      obj.baseUrl = url;
      obj.id = endpoint;
      obj.streamLink = streamElement
        .find(".responsive-embed-stream > iframe")
        .attr("src");
      obj.relative = [];

      $(".flir > a").each((index, el) => {
        const href = $(el).attr("href") || "";
        obj.relative.push({
          title_ref: $(el).text(),
          link_ref: href
            .replace(`${baseUrl}/anime/`, "")
            .replace(`${baseUrl}/episode/`, "")
            .replace(/\//g, ""),
        });
      });

      obj.list_episode = [];
      $("#selectcog > option").each((index, el) => {
        const val = $(el).attr("value") || "";
        obj.list_episode.push({
          list_episode_title: $(el).text(),
          list_episode_endpoint: val
            .replace(`${baseUrl}/episode/`, "")
            .replace(/\//g, ""),
        });
      });
      obj.list_episode.shift();

      const streamLinkResponse = streamElement.find("iframe").attr("src");
      obj.link_stream_response = await episodeHelper.get(streamLinkResponse);

      const streaming1 = [];
      const streaming2 = [];
      const streaming3 = [];

      $("#embed_holder > div.mirrorstream > ul.m360p > li").each((k, v) => {
        streaming1.push({
          driver: $(v).text(),
          link: "/api/v1/streaming/" + $(v).find("a").data()?.content,
        });
      });

      $(".mirrorstream > .m480p > li").each((k, v) => {
        streaming2.push({
          driver: $(v).text(),
          link: "/api/v1/streaming/" + $(v).find("a").data()?.content,
        });
      });

      $(".mirrorstream > .m720p > li").each((k, v) => {
        streaming3.push({
          driver: $(v).text(),
          link: "/api/v1/streaming/" + $(v).find("a").data()?.content,
        });
      });

      obj.mirror_embed1 = { quality: "360p", streaming: streaming1 };
      obj.mirror_embed2 = { quality: "480p", streaming: streaming2 };
      obj.mirror_embed3 = { quality: "720p", streaming: streaming3 };

      let low_quality, medium_quality, high_quality;

      if (
        $("#venkonten > div.venser > div.venutama > div.download > ul > li:nth-child(1)")
          .text() === ""
      ) {
        low_quality = episodeHelper.notFoundQualityHandler(response.data, 0);
        medium_quality = episodeHelper.notFoundQualityHandler(response.data, 1);
        high_quality = episodeHelper.notFoundQualityHandler(response.data, 2);
      } else {
        low_quality = episodeHelper.epsQualityFunction(0, response.data);
        medium_quality = episodeHelper.epsQualityFunction(1, response.data);
        high_quality = episodeHelper.epsQualityFunction(2, response.data);
      }

      obj.quality = { low_quality, medium_quality, high_quality };

      res.send(obj);
    } catch (err) {
      console.error(err);
      if (!res.headersSent)
        res.status(500).send({ status: false, message: err.message });
    }
  },

  getBatchLink: async (req, res) => {
    const endpoint = req.params.endpoint;
    const fullUrl = `${baseUrl}/batch/${endpoint}`;

    try {
      const response = await services.fetchService(fullUrl, res);
      if (!response || res.headersSent) return;

      const $ = cheerio.load(response.data);
      const batch = {};
      batch.title = $(".batchlink > h4").text();
      batch.status = "success";
      batch.baseUrl = fullUrl;

      batch.download_list = {
        low_quality: episodeHelper.batchQualityFunction(0, response.data),
        medium_quality: episodeHelper.batchQualityFunction(1, response.data),
        high_quality: episodeHelper.batchQualityFunction(2, response.data),
      };

      res.send({ status: true, message: "success", batch });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).send({ status: false, message: error.message });
    }
  },

  getGenreList: async (req, res) => {
    const url = `${baseUrl}/genre-list/`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const genres = [];

        $(".genres")
          .find("a")
          .each((index, el) => {
            const href = $(el).attr("href") || "";
            genres.push({
              genre: $(el).text(),
              endpoint: href.replace("/genres/", "").replace(/\//g, ""),
            });
          });

        return res.status(200).json({ status: true, message: "success", genres });
      }

      res.send({ message: response.status, genres: [] });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).send({ status: false, message: error.message, genres: [] });
    }
  },

  getGenrePage: async (req, res) => {
    const genre = req.params.genre;
    const page = req.params.page;
    const url =
      page == 1
        ? `${baseUrl}/genres/${genre}`
        : `${baseUrl}/genres/${genre}/page/${page}`;

    try {
      const response = await services.fetchService(url, res);
      if (!response || res.headersSent) return;

      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const genreAnime = [];

        $(".col-anime-con").each((index, el) => {
          const href = $(el).find(".col-anime-title > a").attr("href") || "";
          genreAnime.push({
            title: $(el).find(".col-anime-title > a").text(),
            link: href.replace(`${baseUrl}/anime/`, ""),
            studio: $(el).find(".col-anime-studio").text(),
            episode: $(el).find(".col-anime-eps").text(),
            rating: $(el).find(".col-anime-rating").text() || null,
            thumb: $(el).find(".col-anime-cover > img").attr("src"),
            season: $(el).find(".col-anime-date").text(),
            sinopsis: $(el).find(".col-synopsis").text(),
            genre: $(el).find(".col-anime-genre").text().trim().split(","),
          });
        });

        return res.status(200).json({ status: true, message: "success", genreAnime });
      }

      return res.send({ message: response.status, genreAnime: [] });
    } catch (error) {
      if (!res.headersSent)
        res.status(500).send({ status: false, message: error.message, genreAnime: [] });
    }
  },
};

module.exports = Services;