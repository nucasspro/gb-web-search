// Client-side safe utils that use dynamic imports
// This file is safe to import on the client side

// Check if we're on the server side
const isServer = typeof window === 'undefined';

/**
 * Function to search Google via API call
 * @param {string} query - Search query 
 */
export async function searchGoogle(query) {
  if (isServer) {
    // Server-side: use direct import
    const { crawlGoogle } = await import('../../pages/api/server/crawler');
    return crawlGoogle(query);
  } else {
    // Client-side: make API call
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&engine=google`);
    return response.json();
  }
}

/**
 * Function to search Baidu via API call
 * @param {string} query - Search query
 */
export async function searchBaidu(query) {
  if (isServer) {
    // Server-side: use direct import
    const { crawlBaidu } = await import('../../pages/api/server/crawler');
    return crawlBaidu(query);
  } else {
    // Client-side: make API call
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&engine=baidu`);
    return response.json();
  }
}

/**
 * Take a screenshot (stub for client)
 */
export async function takeScreenshot() {
  if (isServer) {
    throw new Error('This function should only be called from a browser context');
  }
  return null;
} 