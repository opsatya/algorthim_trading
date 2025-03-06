import axios from 'axios';
import NodeCache from 'node-cache';

const newsCache = new NodeCache({ stdTTL: 3600 }); // 1-hour cache

export const fetchFinancialNews = async () => {
  const cacheKey = 'financial_news';

  // Check cache first
  const cachedNews = newsCache.get(cacheKey);
  if (cachedNews) return cachedNews;

  try {
    if (!process.env.MARKETAUX_API_TOKEN) {
      // Return mock data if API token is not available
      const mockNews = [
        {
          title: "Market Update: Latest Trends in Algorithmic Trading",
          url: "#",
          publishedAt: new Date().toISOString(),
          source: "Trading Insights",
          description: "Recent developments in algorithmic trading strategies..."
        },
        {
          title: "AI-Driven Trading: The Future of Finance",
          url: "#",
          publishedAt: new Date().toISOString(),
          source: "Financial Times",
          description: "How artificial intelligence is reshaping trading..."
        }
      ];
      newsCache.set(cacheKey, mockNews);
      return mockNews;
    }

    const params = {
      api_token: process.env.MARKETAUX_API_TOKEN,
      symbols: 'TSLA,AMZN,MSFT',
      filter_entities: true,
      language: 'en',
      limit: 10
    };

    const response = await axios.get('https://api.marketaux.com/v1/news/all', {
      params: params
    });

    // Process the news data from Marketaux API
    const processedNews = response.data.data.map(item => ({
      title: item.title,
      url: item.url,
      publishedAt: item.published_at,
      source: item.source,
      description: item.description
    }));

    // Cache the processed news
    newsCache.set(cacheKey, processedNews);

    return processedNews;
  } catch (error) {
    console.error('Financial News Fetch Error:', error);
    // Return mock data on error
    const fallbackNews = [
      {
        title: "Market Update: Latest Trends",
        url: "#",
        publishedAt: new Date().toISOString(),
        source: "Trading Insights",
        description: "Latest developments in trading..."
      }
    ];
    return fallbackNews;
  }
};