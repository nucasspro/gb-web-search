// /api/search.js
// Main API endpoint that handles search requests

import { crawlGoogle, crawlBaidu } from '../utils/crawler';

export default async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only GET requests are supported'
      });
    }

    // Get search query from request
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Search query parameter is required'
      });
    }

    console.log(`Processing search request for: "${query}"`);

    // Crawl both search engines in parallel
    const [googleResults, baiduResults] = await Promise.all([
      crawlGoogle(query),
      crawlBaidu(query)
    ]);

    // Return the combined results
    return res.status(200).json({
      query,
      timestamp: new Date().toISOString(),
      google: googleResults,
      baidu: baiduResults
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message
    });
  }
}