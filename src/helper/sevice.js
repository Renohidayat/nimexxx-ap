const axios = require('axios');
const baseUrl = require('../constant/url');

// Daftar User-Agent untuk rotasi
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15',
];

// Ambil User-Agent acak
const getRandomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Delay helper untuk jeda antar request
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Service = {
  fetchService: async (url, res, retries = 3) => {
    const ua = getRandomUA();

    const headers = {
      'User-Agent': ua,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': `${baseUrl}/`,
      'Origin': baseUrl,
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'DNT': '1',
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Jeda acak 300–900ms antar request agar tidak terdeteksi sebagai bot
        await delay(300 + Math.random() * 600);

        const response = await axios.get(url, {
          timeout: 15000,
          headers,
          maxRedirects: 5,
          validateStatus: (status) => status < 500,
        });

        // Jika kena Cloudflare challenge atau 403, retry
        if (response.status === 403 || response.status === 429) {
          console.warn(`⚠️ Attempt ${attempt}/${retries} - Status ${response.status} for: ${url}`);
          if (attempt < retries) {
            await delay(1000 * attempt); // backoff: 1s, 2s, 3s
            continue;
          }
          // Semua retry habis
          if (res && !res.headersSent) {
            return res.status(response.status).json({
              status: false,
              code: response.status,
              message: response.status === 403
                ? 'Akses ditolak oleh server target (403). Coba beberapa saat lagi.'
                : 'Terlalu banyak request (429). Tunggu sebentar.',
            });
          }
          throw new Error(`HTTP ${response.status}`);
        }

        return response;
      } catch (error) {
        console.error(`❌ Attempt ${attempt}/${retries} - Error fetching: ${url}`);

        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', JSON.stringify(error.response.data).substring(0, 200));
        } else if (error.request) {
          console.error('No response:', error.code);
        } else {
          console.error('Error:', error.message);
        }

        if (attempt < retries) {
          await delay(1000 * attempt);
          continue;
        }

        // Semua retry habis, kirim error response
        if (res && !res.headersSent) {
          res.status(500).json({
            status: false,
            code: error.code || 500,
            message: error.message || 'Internal Server Error',
          });
        }
        throw error;
      }
    }
  },
};

module.exports = Service;