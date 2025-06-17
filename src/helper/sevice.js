const axios = require("axios");

const Service = {
    fetchService: async (url, res) => {
        try {
            const response = await axios.get(url, {
                timeout: 7000, // ⏱️ timeout maksimal
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Node.js Server)'
                }
            });
            return response; // langsung kembalikan response
        } catch (error) {
            console.error("❌ Error fetching URL:", url);
            res.status(500).json({
                status: false,
                code: error.code || 500,
                message: error.message || "Internal Server Error"
            });
            throw error;
        }
    }
};

module.exports = Service;
