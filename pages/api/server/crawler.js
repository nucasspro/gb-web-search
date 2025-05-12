// Server-only crawler implementation
import puppeteer from 'puppeteer-core';
let chromium;

try {
  // This import might fail in some environments
  chromium = require('@sparticuz/chromium');
} catch (error) {
  console.log('Chromium import failed, will use default puppeteer browser');
  chromium = null;
}

// Determine if running in serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION;

/**
 * Enhanced stealth setup to avoid bot detection
 */
async function setupStealth(page) {
  // Set a realistic user agent
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.76'
  ];
  
  // Randomly select a user agent
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  await page.setUserAgent(userAgent);

  // Set extra HTTP headers to appear more like a real browser
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
  });

  // Apply evasion techniques
  await page.evaluateOnNewDocument(() => {
    // Remove webdriver property
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false
    });

    // Modify navigator properties
    const newProto = navigator.__proto__;
    delete newProto.webdriver;

    // Add plugins array
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        {
          0: {type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format'},
          name: 'Chrome PDF Plugin',
          filename: 'internal-pdf-viewer',
          description: 'Portable Document Format',
          length: 1
        },
        {
          0: {type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format'},
          name: 'Chrome PDF Viewer',
          filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
          description: 'Portable Document Format',
          length: 1
        },
        {
          0: {type: 'application/x-google-chrome-pdf', suffixes: 'pdf', description: 'Portable Document Format'},
          name: 'Native Client',
          filename: 'internal-nacl-plugin',
          description: 'Native Client Executable',
          length: 1
        }
      ]
    });

    // Mock language array
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en']
    });

    // Add chrome object
    window.chrome = {
      runtime: {}
    };
    
    // Add chrome webstore
    window.chrome.webstore = {
      onInstallStageChanged: {},
      onDownloadProgress: {},
    };

    // Spoof permissions state
    if (!window.Notification) {
      window.Notification = {
        permission: 'default'
      };
    }
    
    // Fake WebGL
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      // UNMASKED_VENDOR_WEBGL
      if (parameter === 37445) {
        return 'Intel Inc.';
      }
      // UNMASKED_RENDERER_WEBGL
      if (parameter === 37446) {
        return 'Intel Iris OpenGL Engine';
      }
      return getParameter.apply(this, arguments);
    };
    
    // Fake screen resolution
    if (window.screen) {
      window.screen.width = 1920;
      window.screen.height = 1080;
      window.screen.availWidth = 1920;
      window.screen.availHeight = 1040;
      window.screen.colorDepth = 24;
      window.screen.pixelDepth = 24;
    }
    
    // Fake timezone
    const nativeDate = Date;
    const nativeToLocaleDateString = Date.prototype.toLocaleDateString;
    
    Date = function(arg) {
      const date = new nativeDate(arg);
      return date;
    };
    Date.prototype.toLocaleDateString = function() {
      return nativeToLocaleDateString.apply(this, arguments);
    };
  });
}

/**
 * Compresses and resizes a base64 image to reduce file size
 */
async function compressScreenshot(page, options = {}) {
  const {
    quality = 50,
    maxWidth = 1024,
    format = 'jpeg'
  } = options;
  
  try {
    // Take screenshot with specified format and quality
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: format,
      quality: quality,
      encoding: 'base64'
    });
    
    // For JPEG format, add proper header
    if (format === 'jpeg') {
      return `data:image/jpeg;base64,${screenshotBuffer}`;
    } 
    // For PNG format, add proper header
    else if (format === 'png') {
      return `data:image/png;base64,${screenshotBuffer}`;
    }
    
    return `data:image/${format};base64,${screenshotBuffer}`;
  } catch (error) {
    console.error('Error compressing screenshot:', error);
    return null;
  }
}

/**
 * Adds a random delay between actions to mimic human behavior
 */
async function randomDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min) + min);
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Types text with random speed to mimic human typing
 */
async function typeWithRandomSpeed(page, selector, text) {
  await page.focus(selector);
  
  for (const char of text) {
    await page.type(selector, char, { delay: Math.floor(Math.random() * 100) + 30 });
    await randomDelay(10, 100);
  }
}

/**
 * Auto-scroll function to scroll down the page to ensure all content is loaded
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          // Scroll back to top before taking screenshot
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
  
  // Wait a bit after scrolling to ensure everything is loaded
  await randomDelay(1000, 2000);
}

/**
 * Function to create mock search results when browser launch fails
 */
function createMockSearchResults(query) {
  return {
    results: [
      {
        title: "Search Results for: " + query,
        url: "https://example.com/search?q=" + encodeURIComponent(query),
        description: "This is a mock search result because the browser could not be launched in the serverless environment."
      },
      {
        title: "Unable to crawl live results",
        url: "https://example.com/error",
        description: "Serverless environment restrictions prevent launching Chrome. Consider using a hosted solution with proper dependencies."
      }
    ],
    screenshot: null,
    error: "Browser could not be launched in serverless environment. Using mock results instead."
  };
}

/**
 * Get a browser executable path based on the environment
 */
async function getBrowserPath() {
  // Try @sparticuz/chromium first
  if (chromium) {
    try {
      return await chromium.executablePath();
    } catch (error) {
      console.log('Error getting chromium executable path:', error.message);
    }
  }
  
  // For local/non-Vercel development on Windows
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  
  // If we're on Windows, use a local browser
  if (process.platform === 'win32') {
    for (const path of possiblePaths) {
      try {
        const fs = require('fs');
        if (fs.existsSync(path)) {
          return path;
        }
      } catch (error) {
        // Ignore errors
      }
    }
  }
  
  // If on Mac
  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  
  // Linux path
  if (process.platform === 'linux') {
    return '/usr/bin/google-chrome';
  }
  
  // Fallback - will cause an error, but we'll handle it
  return null;
}

/**
 * Crawls Google search results for the given query
 */
export async function crawlGoogle(query) {
  let browser = null;
  let screenshotBase64 = null;
  
  try {
    console.log(`Crawling Google for: "${query}"`);
    
    // Always use mock results on Vercel
    if (process.env.VERCEL) {
      console.log('Running in Vercel environment - returning mock results');
      return createMockSearchResults(query);
    }
    
    // Get browser executable path
    const executablePath = await getBrowserPath();
    if (!executablePath) {
      console.log('Could not find a browser executable path');
      return createMockSearchResults(query);
    }
    
    console.log(`Using browser at: ${executablePath}`);
    
    // Common browser options
    const browserOptions = {
      headless: true,
      executablePath,
      args: chromium ? chromium.args : [
        '--no-sandbox',
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--hide-scrollbars',
        '--mute-audio',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-component-extensions-with-background-pages',
        '--disable-extensions',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees',
        '--disable-ipc-flooding-protection',
        '--disable-renderer-backgrounding',
        '--enable-features=NetworkService,NetworkServiceInProcess',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--window-size=1024,768'
      ],
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 1024,
        height: 768
      }
    };
    
    // Launch browser with environment-specific options
    if (isServerless && chromium) {
      console.log('Using serverless browser configuration');
      try {
        browserOptions.executablePath = await chromium.executablePath();
      } catch (error) {
        console.log('Error configuring serverless browser:', error.message);
        return createMockSearchResults(query);
      }
    }
    
    // Attempt to launch browser
    try {
      browser = await puppeteer.launch(browserOptions);
    } catch (error) {
      console.error('Failed to launch browser:', error.message);
      return createMockSearchResults(query);
    }
    
    const page = await browser.newPage();
    await setupStealth(page);
    
    // Navigate directly to Google search results to avoid homepage
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 15000 // Shorter timeout for serverless
    });
    
    // Simplified result extraction that's more resilient
    const results = await page.evaluate(() => {
      const searchResults = [];
      
      // Look for any h3 elements which are usually titles
      const titles = document.querySelectorAll('h3');
      
      titles.forEach(titleElement => {
        // Find the closest anchor tag
        const linkElement = titleElement.closest('a');
        if (!linkElement) return;
        
        const title = titleElement.innerText.trim();
        const url = linkElement.href;
        
        // Find a description - look for nearby text
        let description = '';
        let descElement = titleElement.parentElement;
        
        // Try to find description by looking at siblings or parent siblings
        for (let i = 0; i < 3; i++) {
          if (!descElement) break;
          descElement = descElement.parentElement;
          
          if (descElement) {
            // Look for text content in child elements
            const textNodes = Array.from(descElement.querySelectorAll('div, span, p'))
              .filter(el => el !== titleElement && el.innerText.trim().length > 20);
            
            if (textNodes.length > 0) {
              description = textNodes[0].innerText.trim();
              break;
            }
          }
        }
        
        if (title && url) {
          searchResults.push({
            title,
            url,
            description
          });
        }
      });
      
      return searchResults;
    });
    
    return {
      results: results || [],
      screenshot: null, // Skip screenshot to reduce memory usage
      error: null
    };
  } catch (error) {
    console.error('Error crawling Google:', error);
    return createMockSearchResults(query);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Crawls Baidu search results for the given query
 */
export async function crawlBaidu(query) {
  // Always use mock results on Vercel
  if (process.env.VERCEL) {
    console.log('Running in Vercel environment - returning mock results for Baidu');
    return createMockSearchResults(query);
  }
  
  let browser = null;
  let screenshotBase64 = null;
  
  try {
    console.log(`Crawling Baidu for: "${query}"`);
    
    // Get browser executable path
    const executablePath = await getBrowserPath();
    if (!executablePath) {
      console.log('Could not find a browser executable path');
      return createMockSearchResults(query);
    }
    
    console.log(`Using browser at: ${executablePath}`);
    
    // Common browser options
    const browserOptions = {
      headless: true,
      executablePath,
      args: chromium ? chromium.args : [
        '--no-sandbox',
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--hide-scrollbars',
        '--mute-audio',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-component-extensions-with-background-pages',
        '--disable-extensions',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees',
        '--disable-ipc-flooding-protection',
        '--disable-renderer-backgrounding',
        '--enable-features=NetworkService,NetworkServiceInProcess',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--window-size=1024,768'
      ],
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 1024,
        height: 768
      }
    };
    
    // Launch browser with environment-specific options
    if (isServerless && chromium) {
      console.log('Using serverless browser configuration');
      try {
        browserOptions.executablePath = await chromium.executablePath();
      } catch (error) {
        console.log('Error configuring serverless browser:', error.message);
        return createMockSearchResults(query);
      }
    }
    
    // Attempt to launch browser
    try {
      browser = await puppeteer.launch(browserOptions);
    } catch (error) {
      console.error('Failed to launch browser:', error.message);
      return createMockSearchResults(query);
    }
    
    const page = await browser.newPage();
    await setupStealth(page);
    
    // Navigate directly to Baidu search results
    await page.goto(`https://www.baidu.com/s?wd=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 15000
    });
    
    // Simplified result extraction
    const results = await page.evaluate(() => {
      const searchResults = [];
      
      // Look for any h3 elements
      const titles = document.querySelectorAll('h3');
      
      titles.forEach(titleElement => {
        // Find the link
        const linkElement = titleElement.querySelector('a');
        if (!linkElement) return;
        
        const title = titleElement.innerText.trim();
        const url = linkElement.href;
        
        // Find a description
        let description = '';
        let current = titleElement;
        
        // Look for next sibling with content
        while (current = current.nextElementSibling) {
          if (current && current.innerText && current.innerText.trim().length > 10) {
            description = current.innerText.trim();
            break;
          }
        }
        
        // If no description found in siblings, try parent's siblings
        if (!description && titleElement.parentElement) {
          let parent = titleElement.parentElement;
          while (parent = parent.nextElementSibling) {
            if (parent && parent.innerText && parent.innerText.trim().length > 10) {
              description = parent.innerText.trim();
              break;
            }
          }
        }
        
        if (title && url) {
          searchResults.push({
            title,
            url,
            description
          });
        }
      });
      
      return searchResults;
    });
    
    return {
      results: results || [],
      screenshot: null, // Skip screenshot to reduce memory usage
      error: null
    };
  } catch (error) {
    console.error('Error crawling Baidu:', error);
    return createMockSearchResults(query);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 