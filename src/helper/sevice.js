const puppeteer = require('puppeteer');

const Service = {
    fetchService: async (url, res) => {
        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Node.js Puppeteer)');
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

            const html = await page.content();
            await browser.close();

            return { data: html };
        } catch (error) {
            console.error("❌ Error fetching URL with puppeteer:", url);
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
