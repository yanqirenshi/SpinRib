// Editorial slide renderer for the demo. This is intentionally NOT
// part of the SpinRib library — it's an example of how a consumer
// supplies the slide markup and styling for their own data shape.
//
// The schema this renderer expects on each slide entry:
//   { t: string, tag: string }
// And on each spine row (read indirectly via the (y, x) context — see
// the wrapper `editorialRenderer` factory below):
//   { kicker, spine, hueLight, hueDark }

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'style') Object.assign(node.style, v);
    else if (v != null && v !== false) node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

/**
 * Build a renderSlide callback bound to a SPINES dataset. The factory
 * is needed because the slide context only carries (y, x) — to read
 * row-level fields (kicker, spine, hue) we need access to the spines
 * array.
 *
 * @param {Array} spines
 * @returns {(item, ctx) => HTMLElement}
 */
export function editorialRenderer(spines) {
  return function renderSlide(item, ctx) {
    if (!item) return el('div', { class: 'demo-slide demo-slide-empty' });

    const row = spines[ctx.y];
    const hue = ctx.theme === 'dark' ? row.hueDark : row.hueLight;
    const grain = ctx.theme === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.022)';
    const glyph = ctx.isCover ? '◆' : (ctx.x < 0 ? '◀' : '▶');
    const ribLabel = ctx.x === 0 ? 'SPINE' : (ctx.x < 0 ? 'L-RIB' : 'R-RIB');
    const coord = `${ctx.y + 1}${ctx.x >= 0 ? '+' : ''}${ctx.x}`;

    return el('div', { class: 'demo-slide', style: { '--demo-hue': hue, '--demo-grain': grain } }, [
      el('div', { class: 'demo-slide-image' }, [
        el('div', { class: 'demo-slide-image-meta' }, [
          el('div', { class: 'demo-slide-image-coord' }, coord),
          el('div', { class: 'demo-slide-image-glyph' }, glyph),
        ]),
        el('div', { class: 'demo-slide-image-tag' }, `image · ${item.tag}`),
      ]),
      el('div', { class: 'demo-slide-text' }, [
        el('div', { class: 'demo-slide-kicker' }, `${row.kicker} · ${row.spine}`),
        el('h1', { class: 'demo-slide-title' }, item.t),
        el('div', { class: 'demo-slide-footer' }, [
          el('span', {}, 'SpinRib · No. 014'),
          el('span', {}, `${ribLabel} ${Math.abs(ctx.x) || 0}`),
        ]),
      ]),
    ]);
  };
}

/** Optional: row label for the SpinRib mini-map header. */
export function editorialRowLabel(row /* , y */) {
  return row && row.kicker ? row.kicker.slice(0, 4) : '';
}
