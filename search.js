#!/usr/bin/env node

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const cheerio = require('cheerio');
const fs = require('fs');

// Debug logging helper
const debug = (...args) => {
  if (process.env.DEBUG) {
    console.log(...args);
  }
};

// Add stealth plugin and adblocker plugin to puppeteer
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const BASE_URL = 'https://bookshop.org/search?keywords=';

async function searchBook(query) {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome-stable',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  const searchUrl = `${BASE_URL}${encodeURIComponent(query)}`;

  debug('Navigating to:', searchUrl);
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });

  debug('Waiting for search results container...');
  await page.waitForSelector('#search-hits-container', { visible: true, timeout: 15000 });
  
  debug('Waiting additional time for AJAX content...');
  await page.waitForTimeout(2000);

  const html = await page.content();
  debug('HTML content length:', html.length);
  
  // Save HTML to file for inspection
  if (process.env.DEBUG) {
    fs.writeFileSync('debug_output.html', html);
    debug('Saved HTML to debug_output.html');
  }

  await browser.close();
  
  return parseResponse(html);
}

function parseResponse(html) {
  const $ = cheerio.load(html);
  const results = [];

  debug('Searching for results container...');
  const container = $('#search-hits-container');
  debug('Container found:', container.length > 0);
  
  const items = container.find('li');
  debug('Number of li elements found:', items.length);

  items.each((index, element) => {
    // Skip the last empty li element
    if ($(element).attr('aria-hidden') === 'true') {
      debug('Skipping hidden element at index:', index);
      return;
    }

    const title = $(element).find('h2.fw-700').text().trim();
    const author = $(element).find('p.my-1.flex.items-end').text().trim();
    const href = $(element).find('a[aria-label^="link for"]').attr('href');

    debug(`\nProcessing item ${index + 1}:`);
    debug('Title:', title);
    debug('Author:', author);
    debug('Href:', href);

    // Only add results that have all required fields
    if (title && href) {
      results.push({ title, author, href });
      debug('Added to results');
    } else {
      debug('Skipped - missing required fields');
    }
  });

  debug('\nTotal results found:', results.length);
  return results;
}

const query = process.argv[2];
if (!query) {
  console.error('Please provide a search query.');
  process.exit(1);
}

searchBook(query)
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
