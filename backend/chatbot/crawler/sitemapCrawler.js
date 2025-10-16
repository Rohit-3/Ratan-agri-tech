const fs = require('fs');
const path = require('path');

function parseLocsFromSitemap(xml) {
  const locRegex = /<loc>(.*?)<\/loc>/g;
  const locs = [];
  let m;
  while ((m = locRegex.exec(xml))) {
    locs.push(m[1].trim());
  }
  return locs;
}

function normalizeUrl(base, loc) {
  if (/^https?:\/\//.test(loc)) return loc;
  const baseNoTrailing = base.replace(/\/$/, '');
  return `${baseNoTrailing}${loc.startsWith('/') ? '' : '/'}${loc}`;
}

function extractTextFromHtml(html) {
  try {
    // Remove script/style
    let h = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
    // Extract title
    const titleMatch = h.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    // Replace tags with spaces and decode entities minimally
    let text = h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
    text = text.replace(/\s+/g, ' ').trim();
    // Shorten to keep memory light
    const max = 6000;
    if (text.length > max) text = text.slice(0, max);
    return { title, text };
  } catch {
    return { title: '', text: '' };
  }
}

async function safeFetch(url) {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal, headers: { 'user-agent': 'RatanAgriTechBot/1.0' } });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch {
    return null;
  }
}

async function buildKBFromSitemap({ sitemapPathOrUrl, siteBaseUrl }) {
  // Read sitemap.xml (local or remote)
  let xml;
  try {
    const p = sitemapPathOrUrl.startsWith('http') ? null : sitemapPathOrUrl;
    if (p) {
      xml = fs.readFileSync(p, 'utf-8');
    } else {
      const res = await fetch(sitemapPathOrUrl);
      xml = await res.text();
    }
  } catch (e) {
    throw new Error(`Failed to read sitemap: ${e.message}`);
  }

  const locs = parseLocsFromSitemap(xml).map((l) => normalizeUrl(siteBaseUrl, l));

  // Crawl pages for content (best-effort)
  const pages = [];
  for (const url of locs) {
    const html = await safeFetch(url);
    const { title, text } = html ? extractTextFromHtml(html) : { title: '', text: '' };
    pages.push({
      url,
      title: title || path.basename(url) || 'home',
      topics: [],
      ctas: [],
      content: text
    });
  }

  return { generatedAt: new Date().toISOString(), pages };
}

module.exports = { buildKBFromSitemap };

