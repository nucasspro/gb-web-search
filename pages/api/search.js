import { crawlGoogle, crawlBaidu } from '../utils/crawler';

// Helper function to enable CORS
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    return res.status(200).end();
  }
  
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only GET requests are supported'
      });
    }

    // Set CORS headers for all responses
    setCORSHeaders(res);

    // Get search query from request
    const { query, includeScreenshots = 'true', maxResults } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Search query parameter is required'
      });
    }

    // Convert string parameters to appropriate types
    const shouldIncludeScreenshots = includeScreenshots.toLowerCase() === 'true';
    const resultsLimit = maxResults ? parseInt(maxResults, 10) : undefined;

    console.log(`Processing search request for: "${query}" (Include screenshots: ${shouldIncludeScreenshots})`);

    // Crawl both search engines in parallel
    const [googleResults, baiduResults] = await Promise.all([
      crawlGoogle(query),
      crawlBaidu(query)
    ]);

    // Limit the number of results if specified
    let googleData = googleResults.results || [];
    let baiduData = baiduResults.results || [];
    
    if (resultsLimit && !isNaN(resultsLimit) && resultsLimit > 0) {
      googleData = googleData.slice(0, resultsLimit);
      baiduData = baiduData.slice(0, resultsLimit);
    }

    // Format the results according to the required structure
    const formattedResponse = {
      // Include timestamp for tracking
      timestamp: new Date().toISOString(),
      // Format Google results
      google: {
        data: googleData.map(item => ({
          title: item.title || '',
          link: item.url || '',
          content: item.description || ''
        })),
        image: shouldIncludeScreenshots ? (googleResults.screenshot || '') : '',
        highlight: [] // Empty highlight list as specified
      },
      // Format Baidu results
      baidu: {
        data: baiduData.map(item => ({
          title: item.title || '',
          link: item.url || '',
          content: item.description || ''
        })),
        image: shouldIncludeScreenshots ? (baiduResults.screenshot || '') : '',
        highlight: [] // Empty highlight list as specified
      }
    };

    // Return the combined results
    return res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Error in search API:', error);
    // Set CORS headers even for error responses
    setCORSHeaders(res);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message
    });
  }
} 