// /utils/crawler.js
// Search engine crawling functions

import { getBrowser, setupPage, takeScreenshot } from './browser';

/**
 * Crawls Google search results for the given query
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results and screenshot
 */
export async function crawlGoogle(query) {
  const browser = await getBrowser();
  
  try {
    console.log(`Crawling Google for: "${query}"`);
    const page = await browser.newPage();
    await setupPage(page);
    
    // Navigate to Google
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for search results to load
    await page.waitForSelector('div.g', { timeout: 5000 })
      .catch(() => console.log('Google results selector timeout - continuing anyway'));
    
    // Extract search results
    const results = await page.evaluate(() => {
      const searchItems = Array.from(document.querySelectorAll('div.g, div.yuRUbf'));
      return searchItems.map(item => {
        const titleElement = item.querySelector('h3');
        const linkElement = item.querySelector('a');
        const descriptionElement = item.querySelector('div.VwiC3b, div.IsZvec');
        
        return {
          title: titleElement ? titleElement.innerText.trim() : '',
          url: linkElement ? linkElement.href : '',
          description: descriptionElement ? descriptionElement.innerText.trim() : ''
        };
      }).filter(item => item.title && item.url);
    });
    
    // Take screenshot
    const screenshot = await takeScreenshot(page);
    
    return {
      results: results.slice(0, 10), // Limit to top 10 results
      screenshot,
      error: null
    };
  } catch (error) {
    console.error('Error crawling Google:', error);
    return {
      results: [],
      screenshot: null,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

/**
 * Crawls Baidu search results for the given query
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results and screenshot
 */
export async function crawlBaidu(query) {
  const browser = await getBrowser();
  
  try {
    console.log(`Crawling Baidu for: "${query}"`);
    const page = await browser.newPage();
    await setupPage(page);
    
    // Navigate to Baidu
    await page.goto(`https://www.baidu.com/s?wd=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for search results to load
    await page.waitForSelector('.result', { timeout: 5000 })
      .catch(() => console.log('Baidu results selector timeout - continuing anyway'));
    
    // Extract search results
    const results = await page.evaluate(() => {
      const searchItems = Array.from(document.querySelectorAll('.result, .c-container'));
      return searchItems.map(item => {
        const titleElement = item.querySelector('.t, .c-title');
        const linkElement = titleElement ? titleElement.querySelector('a') : null;
        const descriptionElement = item.querySelector('.c-abstract, .content-abstract');
        
        return {
          title: titleElement ? titleElement.innerText.trim() : '',
          url: linkElement ? linkElement.href : '',
          description: descriptionElement ? descriptionElement.innerText.trim() : ''
        };
      }).filter(item => item.title && item.url);
    });
    
    // Take screenshot
    const screenshot = await takeScreenshot(page);
    
    return {
      results: results.slice(0, 10), // Limit to top 10 results
      screenshot,
      error: null
    };
  } catch (error) {
    console.error('Error crawling Baidu:', error);
    return {
      results: [],
      screenshot: null,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}