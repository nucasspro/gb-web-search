// /utils/browser.js
// Browser setup utilities for Puppeteer

import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';

/**
 * Initialize and return a browser instance optimized for different environments
 * @returns {Promise<Browser>} Puppeteer browser instance
 */
export async function getBrowser() {
  // Check if we're in a development environment
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // In development, use the installed Chrome/Edge browser
    console.log('Development environment detected, using local browser');
    
    // For Windows, try different possible Chrome locations
    const possiblePaths = [
      // Chrome paths
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      // Edge paths (Chromium-based)
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      // Add any other possible paths
    ];

    // Try to find an installed browser
    for (const executablePath of possiblePaths) {
      try {
        // Check if the file exists by trying to launch
        const browser = await puppeteer.launch({
          executablePath,
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
          ],
          defaultViewport: {
            width: 1280,
            height: 800
          },
          ignoreHTTPSErrors: true
        });
        
        console.log(`Successfully launched browser at: ${executablePath}`);
        return browser;
      } catch (error) {
        console.log(`Failed to launch browser at: ${executablePath}`);
        // Continue to the next path
      }
    }
    
    // If no installed browsers found, try to use puppeteer's own Chromium
    console.log('No local browser found, attempting to use puppeteer-core');
    try {
      return await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
        ],
        defaultViewport: {
          width: 1280,
          height: 800
        },
        ignoreHTTPSErrors: true
      });
    } catch (error) {
      console.error('Failed to launch puppeteer-core browser:', error);
      throw new Error('No browser could be launched. Please install Chrome or Edge.');
    }
  } else {
    // In production (Vercel), use the AWS Lambda compatible browser
    console.log('Production environment detected, using @sparticuz/chromium');
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
      encoding: 'base64'
    });
    
    return `data:image/png;base64,${screenshot}`;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    return null;
  }
} 