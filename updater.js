const axios = require('axios');
const cheerio = require('cheerio');
const { Database } = require('@sqlitecloud/drivers');

// Base URL and headers
const BASE_URL = 'https://mangapill.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
  Referer: BASE_URL,
};

// Initialize SQLite Cloud database connection
const db = new Database('sqlitecloud://ch3an8wnhz.sqlite.cloud:8860/manga.db?apikey=2pkgTi7BtfuN4DjZjLOrhsHgBBIArm7PAtiEOq5ioHI');

// Helper function to execute SQL queries
const executeQuery = async (query, params = []) => {
  try {
    const result = await db.sql(query, params);
    return result.length ? result : null;
  } catch (err) {
    throw new Error('Database query failed');
  }
};

// Fetch function with error handling
const fetch = async (url) => {
  try {
    const response = await axios.get(url, { headers: HEADERS });
    return response.data;
  } catch (error) {
    return null;
  }
};

// Fetch manga details
const fetchMangaDetails = async (mangaId) => {
  const mangaUrl = `${BASE_URL}/manga/${mangaId}`;
  const responseText = await fetch(mangaUrl);
  if (!responseText) return { title: null, chapterLinks: [] };

  const $ = cheerio.load(responseText);
  const title = $('h1.font-bold.text-lg.md\\:text-2xl').text().trim() || 'Unknown Title';
  const chapterLinks = $('#chapters a')
    .map((i, el) => BASE_URL + $(el).attr('href'))
    .get()
    .reverse();

  return { title, chapterLinks };
};

// Update manga with chapters and other details
const updateManga = async (mangaId) => {
  try {
    const { title, chapterLinks } = await fetchMangaDetails(mangaId);
    if (!title || !chapterLinks.length) return false;

    const existingChapters = await executeQuery('SELECT chapters FROM mangas WHERE id = ?', [mangaId]);
    const existingChapterCount = existingChapters ? existingChapters[0].chapters : 0;
    const newChapterCount = chapterLinks.length;

    if (newChapterCount > existingChapterCount) {
      await executeQuery('UPDATE mangas SET chapters = ? WHERE id = ?', [newChapterCount, mangaId]);

      for (const chapterUrl of chapterLinks.slice(existingChapterCount)) {
        const chapterImages = await fetchChapterImages(chapterUrl);
        const imageUrls = chapterImages.join(',');

        await executeQuery(
          'INSERT INTO chapters (manga_id, image_urls) VALUES (?, ?)',
          [mangaId, imageUrls]
        );
      }
    }
    return true;
  } catch (err) {
    return false;
  }
};

// Fetch chapter images
const fetchChapterImages = async (chapterUrl) => {
  try {
    const responseText = await fetch(chapterUrl);
    if (!responseText) return [];

    const $ = cheerio.load(responseText);
    const imageUrls = $('img.chapter-image')
      .map((i, el) => $(el).attr('src'))
      .get();

    return imageUrls;
  } catch (err) {
    return [];
  }
};

// Update all manga concurrently
const updateAllManga = async () => {
  try {
    const mangaIds = Array.from({ length: 4616 }, (_, i) => i + 1);
    await Promise.all(mangaIds.map(updateManga));
  } catch (err) {
    // Handle any general error, no logging
  }
};

// Function to repeatedly run every 12 hours
const runEvery12Hours = async () => {
  while (true) {
    await updateAllManga();
    await new Promise((resolve) => setTimeout(resolve, 12 * 60 * 60 * 1000)); // Sleep for 12 hours
  }
};

module.exports = { runEvery12Hours };
