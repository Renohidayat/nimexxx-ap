const { default: Axios } = require("axios");
const cheerio = require("cheerio");
const baseUrl = require("../constant/url");
const qs = require("qs");

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
];

const getRandomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const getAjaxHeaders = () => ({
  'Origin': baseUrl,
  'Referer': `${baseUrl}/`,
  'User-Agent': getRandomUA(),
  'X-Requested-With': 'XMLHttpRequest',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'Accept': '*/*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
});

const episodeHelper = {
  getNonce: async () => {
    const payload = {
      action: "aa1208d27f29ca340c92c66d1926f13f",
    };

    try {
      const url = `${baseUrl}/wp-admin/admin-ajax.php`;
      const response = await Axios.post(url, qs.stringify(payload), {
        headers: getAjaxHeaders(),
        timeout: 10000,
      });
      return response.data.data;
    } catch (error) {
      console.error("getNonce error:", error.message);
      return null;
    }
  },

  getUrlAjax: async (content, nonce) => {
    try {
      const _e = JSON.parse(atob(content));
      const payload = {
        ..._e,
        nonce: nonce,
        action: "2a3505c93b0035d3f455df82bf976b84",
      };

      const url = `${baseUrl}/wp-admin/admin-ajax.php`;
      const response = await Axios.post(url, qs.stringify(payload), {
        headers: getAjaxHeaders(),
        timeout: 10000,
      });

      return atob(response.data.data);
    } catch (error) {
      console.error("getUrlAjax error:", error.message);
      return null;
    }
  },

  get: async (url) => {
    if (!url) return "-";
    try {
      const response = await Axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': getRandomUA(),
          'Accept': 'text/html,*/*',
          'Referer': `${baseUrl}/`,
        },
      });
      const $ = cheerio.load(response.data);
      const html = $.html();
      let source1 = html.search('"file":');
      let source2 = html.search("'file':");

      if (source1 !== -1) {
        const end = html.indexOf('","', source1);
        return html.substring(source1 + 8, end);
      } else if (source2 !== -1) {
        const end = html.indexOf("','", source2);
        return html.substring(source2 + 8, end);
      }
      return "-";
    } catch (error) {
      return "-";
    }
  },

  notFoundQualityHandler: (res, num) => {
    const $ = cheerio.load(res);
    const download_links = [];
    const element = $(".download");
    let response;

    element.filter(function () {
      if ($(this).find(".anime-box > .anime-title").eq(0).text() === "") {
        $(this)
          .find(".yondarkness-box")
          .filter(function () {
            const quality = $(this)
              .find(".yondarkness-title")
              .eq(num)
              .text()
              .split("[")[1]
              ?.split("]")[0];
            const size = $(this)
              .find(".yondarkness-title")
              .eq(num)
              .text()
              .split("]")[1]
              ?.split("[")[1];
            $(this)
              .find(".yondarkness-item")
              .eq(num)
              .find("a")
              .each((idx, el) => {
                download_links.push({ host: $(el).text(), link: $(el).attr("href") });
                response = { quality, size, download_links };
              });
          });
      } else {
        $(this)
          .find(".anime-box")
          .filter(function () {
            const quality = $(this)
              .find(".anime-title")
              .eq(num)
              .text()
              .split("[")[1]
              ?.split("]")[0];
            const size = $(this)
              .find(".anime-title")
              .eq(num)
              .text()
              .split("]")[1]
              ?.split("[")[1];
            $(this)
              .find(".anime-item")
              .eq(num)
              .find("a")
              .each((idx, el) => {
                download_links.push({ host: $(el).text(), link: $(el).attr("href") });
                response = { quality, size, download_links };
              });
          });
      }
    });

    return response;
  },

  epsQualityFunction: (num, res) => {
    const $ = cheerio.load(res);
    const element = $(".download");
    const download_links = [];
    let response;

    element.find("ul").filter(function () {
      const quality = $(this).find("li").eq(num).find("strong").text();
      const size = $(this).find("li").eq(num).find("i").text();
      $(this)
        .find("li")
        .eq(num)
        .find("a")
        .each(function () {
          download_links.push({ host: $(this).text(), link: $(this).attr("href") });
          response = { quality, size, download_links };
        });
    });

    return response;
  },

  batchQualityFunction: (num, res) => {
    const $ = cheerio.load(res);
    const element = $(".batchlink");
    const download_links = [];
    let response;

    element.find("ul").filter(function () {
      const quality = $(this).find("li").eq(num).find("strong").text();
      const size = $(this).find("li").eq(num).find("i").text();
      $(this)
        .find("li")
        .eq(num)
        .find("a")
        .each(function () {
          download_links.push({ host: $(this).text(), link: $(this).attr("href") });
          response = { quality, size, download_links };
        });
    });

    return response;
  },
};

module.exports = episodeHelper;