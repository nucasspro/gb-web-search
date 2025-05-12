// Search API route
import { searchGoogle, searchBaidu } from '../../app/api/server-action';

// Set a reasonable timeout for the API
const TIMEOUT = 60 * 1000; // 60 seconds

// Configure API options
export const config = {
  api: {
    // Disable the default body parser to handle larger screenshot data
    bodyParser: {
      sizeLimit: '10mb',
    },
    // Set a longer timeout for serverless functions
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Set timeout for the request
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), TIMEOUT)
    );

    // Get search parameters
    const { query, engine = 'google' } = req.method === 'GET' 
      ? req.query 
      : req.body;

    // Validate query
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Invalid or missing query parameter' });
      return;
    }

    // Execute the search with timeout
    const searchPromise = engine.toLowerCase() === 'baidu' 
      ? searchBaidu(query)
      : searchGoogle(query);

    // Race between search and timeout
    const result = await Promise.race([searchPromise, timeoutPromise]);

    // Return search results with proper structure
    res.status(200).json({
      success: !result.error,
      data: {
        query,
        engine: engine.toLowerCase(),
        results: result.results.map(item => ({
          title: item.title,
          url: item.url,
          description: item.description,
        })),
        image: result.screenshot,
      },
      error: result.error,
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      data: null
    });
  }
} 