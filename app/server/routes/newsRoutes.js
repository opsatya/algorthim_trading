import express from 'express';
import { fetchFinancialNews } from '../services/newsService.js';

const router = express.Router();

// Trending news endpoint
router.get('/trending', async (req, res) => {
  try {
    const newsData = await fetchFinancialNews();
    res.json({ news: newsData });
  } catch (error) {
    console.error('Error fetching trending news:', error);
    res.status(500).json({ 
      message: 'Failed to fetch trending news',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

export default router;