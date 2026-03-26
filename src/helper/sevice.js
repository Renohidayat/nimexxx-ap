const axios = require('axios');

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Service = {
  fetchService: async (url, res, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await delay(200 + Math.random() * 300);

        const response = await axios.get('https://api.scraperapi.com/', {
          params: {
            api_key: SCRAPER_API_KEY,
            url: url,
            render: false,
          },
          timeout: 25000,
        });

        return response;
      } catch (error) {
        console.error(`❌ Attempt ${attempt}/${retries} - Error fetching: ${url}`);
        console.error('Error:', error.message);

        if (attempt < retries) {
          await delay(1000 * attempt);
          continue;
        }

        if (res && !res.headersSent) {
          res.status(500).json({
            status: false,
            code: error.response?.status || error.code || 500,
            message: error.message || 'Internal Server Error',
          });
        }
        throw error;
      }
    }
  },
};

module.exports = Service;