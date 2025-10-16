// Rule-based dialogue engine enriched with KB/Graph and session memory

const defaultIntents = [
  { name: 'greet', patterns: [/\b(hi|hello|hey)\b/i] },
  { name: 'products', patterns: [/product|machine|equipment|price|cost|catalog|range/i] },
  { name: 'contact', patterns: [/contact|phone|email|address|reach|call|whatsapp/i] },
  { name: 'agent', patterns: [/agent|human|support|live|person|representative/i] },
];

function first(arr) { return Array.isArray(arr) && arr.length ? arr[0] : null; }

class DialogueEngine {
  constructor(intents = defaultIntents) {
    this.intents = intents;
  }

  detectIntent(text) {
    for (const intent of this.intents) {
      if (intent.patterns.some((re) => re.test(text))) return intent.name;
    }
    return 'fallback';
  }

  buildAnswerFromKB(intent, { graph, kb, lastPath }) {
    try {
      if (!kb || !graph) return null;
      const pages = kb.pages || [];
      const home = first(pages);
      const current = (lastPath && pages.find(p => new URL(p.url).pathname === new URL(lastPath, p.url).pathname)) || home;

      if (intent === 'products') {
        // Prefer pages grouped with current via same-section relation
        const neighbors = current ? graph.neighbors(current.url, 'same-section') : [];
        const suggest = (neighbors.length ? neighbors : pages.slice(0, 3))
          .map(n => (n.data && n.data.title ? `[${n.data.title}](${n.id})` : n.id))
          .slice(0, 3);
        return `We offer a range of agricultural machines. You can explore here: ${suggest.join(', ')}. Which product are you interested in?`;
      }

      if (intent === 'contact') {
        // Try to find a contact-like page
        const contactPage = pages.find(p => /contact|about|reach/i.test(p.title)) || home;
        return `You can reach us at +91 7726017648 or ratanagritech@gmail.com. More details: ${contactPage ? contactPage.url : ''}`;
      }

      // Retrieval for general queries: find top page by keyword overlap
      if (intent === 'fallback') {
        const q = (lastPath && lastPath.query) || '';
        const terms = (q || '').toString().toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
        if (terms.length) {
          const scored = pages.map(p => {
            const text = `${p.title} ${p.content || ''}`.toLowerCase();
            let score = 0;
            for (const t of terms) if (text.includes(t)) score++;
            return { p, score };
          }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
          if (scored.length) {
            const links = scored.map(x => `[${x.p.title}](${x.p.url})`).join(', ');
            return `Here are relevant pages I found: ${links}.`;
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  respond(text, { graph, kb, session }) {
    const clean = (text || '').toString();
    const intent = this.detectIntent(clean);

    // Update session memory
    if (session && session.state) {
      session.state.lastIntent = intent;
    }

    // Agent handoff flow with confirmation
    if (intent === 'agent') {
      if (session && session.state && !session.state.agentRequested) {
        session.state.agentRequested = true;
        return { intent, reply: 'I can connect you to a live agent. Would you like me to proceed?' };
      }
      return { intent, reply: 'Okay, I will notify our team. Please share your phone or email for a quick follow-up.' };
    }

    // Try KB-backed answers first
    const kbAnswer = this.buildAnswerFromKB(intent, { graph, kb, lastPath: session?.lastPath });
    if (kbAnswer) return { intent, reply: kbAnswer };

    if (intent === 'greet') {
      return { intent, reply: 'Hello! How can I assist you today?' };
    }

    // Fallback with loop prevention: do not repeat same fallback twice in a row
    const lastBot = session?.history?.slice().reverse().find(m => m.role === 'bot');
    const alreadyPrompted = lastBot && /connect you to an agent/i.test(lastBot.text || '');
    if (alreadyPrompted) {
      return { intent: 'fallback', reply: 'Could you clarify what you are looking for? For example: product price, contact, or payment.' };
    }
    return { intent: 'fallback', reply: "I'm not sure yet. Can I connect you to an agent?" };
  }
}

module.exports = { DialogueEngine };

