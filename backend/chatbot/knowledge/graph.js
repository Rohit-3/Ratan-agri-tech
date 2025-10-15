// Lightweight in-memory knowledge graph using adjacency maps

class KnowledgeGraph {
  constructor() {
    this.nodes = new Map(); // id -> data
    this.edges = new Map(); // id -> Set(neighborIds)
  }

  upsertNode(id, data) {
    this.nodes.set(id, { id, ...(data || {}) });
    if (!this.edges.has(id)) this.edges.set(id, new Set());
  }

  link(a, b, relation = 'related') {
    const edgeId = `${a}::${relation}::${b}`;
    // store relation as metadata on target node's incoming set
    this.upsertNode(a, this.nodes.get(a) || {});
    this.upsertNode(b, this.nodes.get(b) || {});
    const setA = this.edges.get(a);
    setA.add(JSON.stringify({ to: b, relation }));
    return edgeId;
  }

  neighbors(id, filterRelation) {
    const setA = this.edges.get(id) || new Set();
    const results = [];
    for (const s of setA) {
      const e = JSON.parse(s);
      if (!filterRelation || e.relation === filterRelation) {
        results.push({ id: e.to, relation: e.relation, data: this.nodes.get(e.to) });
      }
    }
    return results;
  }
}

function buildGraphFromKB(kb) {
  const g = new KnowledgeGraph();
  for (const p of kb.pages || []) {
    const id = p.url;
    g.upsertNode(id, { type: 'page', title: p.title, topics: p.topics || [], ctas: p.ctas || [] });
  }
  // naive relations: link pages sharing the same first path segment
  const bySeg = new Map();
  for (const p of kb.pages || []) {
    const seg = new URL(p.url).pathname.split('/')[1] || 'root';
    if (!bySeg.has(seg)) bySeg.set(seg, []);
    bySeg.get(seg).push(p.url);
  }
  for (const [_seg, urls] of bySeg.entries()) {
    for (let i = 0; i < urls.length; i++) {
      for (let j = i + 1; j < urls.length; j++) {
        g.link(urls[i], urls[j], 'same-section');
        g.link(urls[j], urls[i], 'same-section');
      }
    }
  }
  return g;
}

module.exports = { KnowledgeGraph, buildGraphFromKB };

