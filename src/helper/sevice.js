const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const Service = {
  fetchService: async (url, res) => {
    let browser = null;

    try {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Node.js Puppeteer)');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

      const html = await page.content();
      await browser.close();

      return { data: html };
    } catch (error) {
      if (browser) await browser.close();
      console.error("❌ Puppeteer error:", error);
      if (res) {
        res.status(500).json({
          status: false,
          code: error.code || 500,
          message: error.message || "Internal Server Error"
        });
      }
      throw error;
    }
  }
};

module.exports = Service;
