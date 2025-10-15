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

async function buildKBFromSitemap({ sitemapPathOrUrl, siteBaseUrl }) {
  // For now, read local sitemap.xml
  let xml;
  try {
    const p = sitemapPathOrUrl.startsWith('http') ? null : sitemapPathOrUrl;
    if (p) {
      xml = fs.readFileSync(p, 'utf-8');
    } else {
      // Remote fetch fallback (not used initially)
      const res = await fetch(sitemapPathOrUrl);
      xml = await res.text();
    }
  } catch (e) {
    throw new Error(`Failed to read sitemap: ${e.message}`);
  }

  const locs = parseLocsFromSitemap(xml).map((l) => normalizeUrl(siteBaseUrl, l));
  const kb = {
    generatedAt: new Date().toISOString(),
    pages: locs.map((url) => ({ url, title: path.basename(url) || 'home', topics: [], ctas: [] }))
  };
  return kb;
}

module.exports = { buildKBFromSitemap };

