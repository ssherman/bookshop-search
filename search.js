#!/usr/bin/env node

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const cheerio = require('cheerio');

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

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });

  // Wait for the search results to load
  await page.waitForSelector('#full-results .search-result-card', { visible: true, timeout: 10000 });

  const html = await page.content();
  await browser.close();
  
  return parseResponse(html);
}

function parseResponse(html) {
  const $ = cheerio.load(html);
  const results = [];

  $('#full-results .search-result-card').each((index, element) => {
    const title = $(element).find('h2.title a').text().trim();
    let author = $(element).find('h3').first().text().trim();
    
    // Clean up the author field
    author = author.replace(/\s+/g, ' ').replace(', et al.', '').trim();

    const href = $(element).find('h2.title a').attr('href');

    results.push({ title, author, href });
  });

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
