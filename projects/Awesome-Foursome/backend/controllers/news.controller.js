const NEWSAPI_BASE = "https://newsapi.org/v2/everything";

export async function getNews(req, res) {
	try {
		const apiKey = process.env.NEWSAPI_KEY;
		if (!apiKey) {
			return res.status(500).json({ message: "NEWSAPI_KEY is not set" });
		}

		const query = req.query.q || "artificial intelligence";
		const url = `${NEWSAPI_BASE}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`NewsAPI responded with ${response.status}`);
		}

		const data = await response.json();

		const news = (data.articles || []).map((item) => ({
			id: item.url,
			title: item.title,
			body: item.description || item.title,
			imageUrl: item.urlToImage || null,
			url: item.url,
		}));

		return res.status(200).json(news);
	} catch (error) {
		return res.status(500).json({ message: "Failed to fetch news", error: error.message });
	}
}

export default { getNews };
