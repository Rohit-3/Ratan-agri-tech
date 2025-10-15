// Simple decision-tree suggestions based on last visited path

function suggestForPath(pathname) {
  if (pathname.includes('products')) {
    return [
      { type: 'cta', label: 'See Brush Cutters', url: '#/products?cat=BrushCutter' },
      { type: 'cta', label: 'Get a custom quote', url: '#/contact' },
    ];
  }
  if (pathname.includes('pricing')) {
    return [
      { type: 'cta', label: 'Request a demo', url: '#/contact' },
      { type: 'cta', label: 'Talk to sales', url: 'mailto:ratanagritech@gmail.com' },
    ];
  }
  return [ { type: 'cta', label: 'Browse products', url: '#/products' } ];
}

module.exports = { suggestForPath };

