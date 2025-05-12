// /utils/crawler.js
// Search engine crawling functions

import puppeteer from 'puppeteer';

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
 * @param {string} base64Image - Original base64 image
 * @param {number} quality - Image quality (1-100)
 * @param {number} maxWidth - Maximum width of the image
 * @returns {Promise<string>} Compressed base64 image
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
 * Crawls Google search results for the given query
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results and screenshot
 */
export async function crawlGoogle(query) {
  let browser = null;
  let screenshotBase64 = null;
  
  try {
    console.log(`Crawling Google for: "${query}"`);
    
    // Launch browser with optimized options
    browser = await puppeteer.launch({
      headless: 'new', // Use the new headless mode
      args: [
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
        '--window-size=1280,800'
      ],
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 1280,
        height: 800
      }
    });
    
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    
    await setupStealth(page);
    
    // Random delay before navigating to mimic human behavior
    await randomDelay(1000, 3000);
    
    // First navigate to Google homepage
    await page.goto('https://www.google.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Add random delay to mimic human behavior
    await randomDelay(1000, 2000);
    
    // Check if search input exists (could be input or textarea depending on Google version)
    const inputExists = await page.evaluate(() => {
      const inputSearch = document.querySelector('input[name="q"]');
      const textareaSearch = document.querySelector('textarea[name="q"]');
      return { 
        hasInput: !!inputSearch, 
        hasTextarea: !!textareaSearch
      };
    });
    
    if (!inputExists.hasInput && !inputExists.hasTextarea) {
      console.log('Google search input not found. There might be a CAPTCHA or other issue.');
      throw new Error('Google search input not found');
    }
    
    // Add small delay before typing to mimic human behavior
    await randomDelay(500, 1500);
    
    // Type the search query with random typing speed
    if (inputExists.hasTextarea) {
      await typeWithRandomSpeed(page, 'textarea[name="q"]', query);
    } else {
      await typeWithRandomSpeed(page, 'input[name="q"]', query);
    }
    
    // Small delay before pressing Enter (like a human would)
    await randomDelay(300, 800);
    
    await page.keyboard.press('Enter');
    
    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Add explicit delay to let the page fully render
    await randomDelay(2000, 3000);
    
    // Check if CAPTCHA appears
    const captchaExists = await page.evaluate(() => {
      return document.body.innerText.includes('CAPTCHA') || 
             document.body.innerText.includes('unusual traffic') ||
             document.querySelector('#recaptcha') !== null;
    });
    
    if (captchaExists) {
      console.log('CAPTCHA detected on Google, waiting for user to solve it...');
      await page.waitForTimeout(60000); // 60 seconds to solve CAPTCHA
      
      // Check if we're past the CAPTCHA
      const stillOnCaptcha = await page.evaluate(() => {
        return document.body.innerText.includes('CAPTCHA') || 
               document.body.innerText.includes('unusual traffic') ||
               document.querySelector('#recaptcha') !== null;
      });
      
      if (stillOnCaptcha) {
        throw new Error('CAPTCHA not solved. Please try running the search manually.');
      }
    }
    
    // Scroll down the page to load more results and capture more content
    await autoScroll(page);
    
    // Take a compressed screenshot
    screenshotBase64 = await compressScreenshot(page, {
      quality: 40,
      maxWidth: 1024,
      format: 'jpeg'
    });
    
    console.log("Google screenshot captured (compressed image)");
    
    // Wait for search results to load - using multiple possible selectors
    try {
      await Promise.race([
        page.waitForSelector('div.g', { timeout: 5000 }),
        page.waitForSelector('[data-sokoban-grid]', { timeout: 5000 }),
        page.waitForSelector('.main', { timeout: 5000 }),
        page.waitForSelector('h3', { timeout: 5000 }),
        page.waitForSelector('a[ping]', { timeout: 5000 })
      ]);
    } catch (error) {
      console.log('Google results selector timeout - continuing anyway');
    }
    
    // Extract search results with a more comprehensive approach
    const results = await page.evaluate(() => {
      console.log('Evaluating Google search results');
      
      const searchResults = [];
      
      // Similar to the C# code, start with cite tags
      const citeElements = document.querySelectorAll('cite');
      
      citeElements.forEach(citeElement => {
        try {
          // Find the parent that contains the link (4 levels up from cite)
          const parentNode = citeElement.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
          if (!parentNode) return;
          
          // Get the link from the parent (usually an 'a' tag)
          const link = parentNode.getAttribute('href') || parentNode.querySelector('a')?.href || '';
          
          // Find the h3 tag (similar to C# code)
          const h3Node = parentNode.querySelector('h3');
          if (!h3Node) return;
          
          // Get the title from h3
          const title = h3Node.innerText.trim();
          if (!title) return;
          
          // Go up to find the content container (similar to 8 levels up in C# code)
          let contentContainer = parentNode;
          for (let i = 0; i < 6; i++) {
            contentContainer = contentContainer.parentElement;
            if (!contentContainer) break;
          }
          
          // Find spans without class for content
          const spans = contentContainer?.querySelectorAll('span:not([class])') || [];
          let content = '';
          
          // Get the last span content as description (similar to C#)
          if (spans.length > 0) {
            content = spans[spans.length - 1].innerText.trim();
          } else {
            // Fallback to other common description elements
            const descElement = contentContainer?.querySelector('.VwiC3b') || 
                              contentContainer?.querySelector('[data-sncf="1"]');
            content = descElement ? descElement.innerText.trim() : '';
          }
          
          // Only add if we have a title
          if (title) {
            searchResults.push({
              title,
              url: link,
              description: content
            });
          }
        } catch (error) {
          // Skip this element if there's an error
          console.log('Error processing element:', error);
        }
      });
      
      return searchResults;
    });
    
    console.log(`Found ${results.length} Google results`);
    
    return {
      results: results || [], // Ensure results is always an array
      screenshot: screenshotBase64,
      error: null
    };
  } catch (error) {
    console.error('Error crawling Google:', error);
    return {
      results: [],
      screenshot: screenshotBase64,
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
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
 * Crawls Baidu search results for the given query
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results and screenshot
 */
export async function crawlBaidu(query) {
  let browser = null;
  let screenshotBase64 = null;
  
  try {
    console.log(`Crawling Baidu for: "${query}"`);
    
    // Launch browser with bundled Chromium
    browser = await puppeteer.launch({
      headless: 'new', // Use the new headless mode
      args: [
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
        '--window-size=1280,800'
      ],
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 1280,
        height: 800
      }
    });
    
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    
    await setupStealth(page);
    
    // Add random delay before navigating
    await randomDelay(1000, 3000);
    
    // Navigate to Baidu with the search query
    await page.goto(`https://www.baidu.com/s?wd=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Add explicit delay to let the page fully render
    await randomDelay(2000, 4000);
    
    // Scroll down the page to load more results
    await autoScroll(page);
    
    // Take a compressed screenshot
    screenshotBase64 = await compressScreenshot(page, {
      quality: 40,
      maxWidth: 1024,
      format: 'jpeg'
    });
    
    console.log("Baidu screenshot captured (compressed image)");
    
    // Wait for search results to load
    try {
      await Promise.race([
        page.waitForSelector('.result', { timeout: 5000 }),
        page.waitForSelector('.c-container', { timeout: 5000 }),
        page.waitForSelector('h3', { timeout: 5000 })
      ]);
    } catch (error) {
      console.log('Baidu results selector timeout - continuing anyway');
    }
    
    // Extract search results
    const results = await page.evaluate(() => {
      console.log('Evaluating Baidu search results');
      
      const searchResults = [];
      
      // Use the same CSS selector as in C# code
      const resultElements = document.querySelectorAll(".result.c-container.xpath-log, .result.c-container");
      console.log(`Found ${resultElements.length} Baidu result elements`);
      
      // If no results, return empty array
      if (resultElements.length === 0) {
        console.log("Baidu search returned no results");
        return searchResults;
      }
      
      for (const item of resultElements) {
        try {
          // Try to find the title and link using the same selector as in C# code
          const postComponent = item.querySelector("h3 > a");
          if (!postComponent) continue;
          
          const title = postComponent.textContent.trim();
          const link = postComponent.getAttribute("href");
          
          // Try to find the content using the same selector as in C# code
          const spanElement = item.querySelector("span");
          const content = spanElement ? spanElement.textContent.trim() : "";
          
          if (title) {
            searchResults.push({
              title,
              url: link,
              description: content
            });
          }
        } catch (error) {
          console.log('Error processing Baidu element:', error);
        }
      }
      
      return searchResults;
    });
    
    console.log(`Found ${results.length} Baidu results`);
    
    return {
      results: results || [], // Ensure results is always an array
      screenshot: screenshotBase64,
      error: null
    };
  } catch (error) {
    console.error('Error crawling Baidu:', error);
    return {
      results: [],
      screenshot: screenshotBase64,
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 