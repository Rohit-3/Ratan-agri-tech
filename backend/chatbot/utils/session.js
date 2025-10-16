// Naive in-memory session store (replace with Redis in production)

const sessions = new Map();

function getSession(sessionId) {
  const id = sessionId || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (!sessions.has(id)) sessions.set(id, { id, history: [], lastPath: '/', state: { lastIntent: null, agentRequested: false } });
  return sessions.get(id);
}

module.exports = { getSession };

