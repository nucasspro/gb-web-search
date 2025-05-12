'use server';

// Server actions for search functionality
// This file is never loaded on the client side

import { crawlGoogle, crawlBaidu } from '../../pages/api/server/crawler';

/**
 * Server action to search Google
 */
export async function searchGoogle(query) {
  try {
    return await crawlGoogle(query);
  } catch (error) {
    console.error('Error searching Google:', error);
    return {
      results: [],
      screenshot: null,
      error: error.message
    };
  }
}

/**
 * Server action to search Baidu
 */
export async function searchBaidu(query) {
  try {
    return await crawlBaidu(query);
  } catch (error) {
    console.error('Error searching Baidu:', error);
    return {
      results: [],
      screenshot: null,
      error: error.message
    };
  }
} 