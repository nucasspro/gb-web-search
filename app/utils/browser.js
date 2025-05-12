// /utils/browser.js
// Browser setup utilities for Puppeteer

import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';

/**
 * Initialize and return a browser instance optimized for Vercel
 * @returns {Promise<Browser>} Puppeteer browser instance
 */
export async function getBrowser() {
  return puppeteer.launch({
    args: [
      ...chrome.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ],
    defaultViewport: {
      width: 1280,
      height: 800
    },
    executablePath: await chrome.executablePath(),
    headless: true,
    ignoreHTTPSErrors: true
  });
}

/**
 * Configure a browser page to avoid detection
 * @param {Page} page - Puppeteer page object
 */
export async function setupPage(page) {
  // Set a realistic user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
  );

  // Set extra HTTP headers to appear more like a real browser
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
  });

  // Disable webdriver flag to avoid detection
  await page.evaluateOnNewDocument(() => {
    // Remove webdriver property
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false
    });
  });
}

/**
 * Takes a screenshot of the current page
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<string>} Base64 encoded screenshot
 */
export async function takeScreenshot(page) {
  try {
    const screenshot = await page.screenshot({ 
      fullPage: true,
      encoding: 'base64',
      quality: 80 // Lower quality for smaller file size
    });
    
    return `data:image/png;base64,${screenshot}`;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    return null;
  }
}