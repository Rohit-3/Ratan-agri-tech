// Rule-based dialogue engine with intents/entities via regex

const defaultIntents = [
  { name: 'greet', patterns: [/\b(hi|hello|hey)\b/i], reply: 'Hello! How can I assist you today?' },
  { name: 'products', patterns: [/product|machine|equipment/i], reply: 'We offer Power Tillers, Brush Cutters, Earth Augers, and Chainsaws. Which interests you?' },
  { name: 'contact', patterns: [/contact|phone|email|address/i], reply: 'You can reach us at +91 7726017648 or ratanagritech@gmail.com.' },
  { name: 'agent', patterns: [/agent|human|support/i], reply: 'I can connect you to a live agent. Would you like me to proceed?' },
];

class DialogueEngine {
  constructor(intents = defaultIntents) {
    this.intents = intents;
  }

  detectIntent(text) {
    for (const intent of this.intents) {
      if (intent.patterns.some((re) => re.test(text))) return intent;
    }
    return null;
  }

  respond(text, context = {}) {
    const intent = this.detectIntent(text || '');
    if (intent) {
      return { intent: intent.name, reply: intent.reply, context };
    }
    return { intent: 'fallback', reply: "I'm not sure yet. Can I connect you to an agent?", context };
  }
}

module.exports = { DialogueEngine };

