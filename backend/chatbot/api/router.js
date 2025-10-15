const express = require('express');
const router = express.Router();

const { buildKBFromSitemap } = require('../crawler/sitemapCrawler');
const { buildGraphFromKB } = require('../knowledge/graph');
const { DialogueEngine } = require('../dialog/engine');
const { getSession } = require('../utils/session');
const { suggestForPath } = require('../suggestions/suggest');
const path = require('path');

// In-memory KB/Graph
let KB = null;
let GRAPH = null;
const engine = new DialogueEngine();

async function ensureKB(req) {
  if (KB && GRAPH) return;
  const base = `${req.headers['x-forwarded-proto'] || req.protocol}://${req.get('host')}`;
  const sitemapLocal = path.resolve(__dirname, '../../../public/sitemap.xml');
  KB = await buildKBFromSitemap({ sitemapPathOrUrl: sitemapLocal, siteBaseUrl: base }).catch(async () => {
    // Fallback to public/sitemap.xml relative to project root; if not available, make minimal KB
    return { generatedAt: new Date().toISOString(), pages: [ { url: base + '/', title: 'home', topics: [], ctas: [] } ] };
  });
  GRAPH = buildGraphFromKB(KB);
}

router.get('/knowledge', async (req, res) => {
  try {
    await ensureKB(req);
    res.json({ success: true, data: KB });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/chat', async (req, res) => {
  try {
    await ensureKB(req);
    const { message = '', session_id = '', last_path = '/' } = req.body || {};
    const sess = getSession(session_id);
    if (last_path) sess.lastPath = last_path;
    const result = engine.respond(message, { lastPath: sess.lastPath });
    sess.history.push({ role: 'user', text: message });
    sess.history.push({ role: 'bot', text: result.reply });
    const suggestions = suggestForPath(sess.lastPath || '/');
    res.json({ success: true, reply: result.reply, intent: result.intent, session_id: sess.id, suggestions });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/agent-connect', async (_req, res) => {
  res.json({ success: true, data: { status: 'agent-bridge-not-configured' } });
});

module.exports = router;

