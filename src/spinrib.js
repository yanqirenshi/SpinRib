import { THEME, MINI_SIZES, ANIM_DURATION_MS } from './theme.js';
import { injectStyles } from './styles.js';

const ARROW_SVG = {
  up:    '<polygon points="14,4 24,18 4,18" />',
  down:  '<polygon points="4,6 24,6 14,20" />',
  left:  '<polygon points="18,4 4,14 18,24" />',
  right: '<polygon points="6,4 20,14 6,24" />',
};
const ARROW_LABEL = { up: '↑', down: '↓', left: '←', right: '→' };

// items.left[i] is the i-th rib outward from the spine on the left side
// (so items.left[0] is at x = -1, items.left[1] is at x = -2, ...).
// items.right[i] mirrors that on the right (x = +1, +2, ...).
// cover is the spine slide (x = 0) and is required.
function leftLen(row)  { return row.items && row.items.left  ? row.items.left.length  : 0; }
function rightLen(row) { return row.items && row.items.right ? row.items.right.length : 0; }

function makeSlide(y, x, row, item, isCover) {
  return {
    y, x,
    kicker: row.kicker,
    spine: row.spine,
    title: item.t,
    tag: item.tag,
    isCover,
    hueLight: row.hueLight,
    hueDark: row.hueDark,
    coord: `${y + 1}${x >= 0 ? '+' : ''}${x}`,
  };
}

function flatten(spines) {
  const slides = [];
  spines.forEach((row, y) => {
    if (!row.cover) {
      throw new Error(`SpinRib: spine row ${y} (${row.kicker || ''}) is missing a cover`);
    }
    slides.push(makeSlide(y, 0, row, row.cover, true));
    const left  = (row.items && row.items.left)  || [];
    const right = (row.items && row.items.right) || [];
    left.forEach((it, i)  => slides.push(makeSlide(y, -(i + 1), row, it, false)));
    right.forEach((it, i) => slides.push(makeSlide(y,  (i + 1), row, it, false)));
  });
  return slides;
}

function findSlide(slides, y, x) {
  return slides.find((s) => s.y === y && s.x === x) || null;
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'style') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v !== null && v !== undefined && v !== false) {
      node.setAttribute(k, v === true ? '' : String(v));
    }
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined && v !== false) {
      node.setAttribute(k, v === true ? '' : String(v));
    }
  }
  return node;
}

export class SpinRib {
  /**
   * @param {object} options
   * @param {HTMLElement} options.container — host element to mount into
   * @param {Array} options.spines — array of spine rows
   * @param {'light'|'dark'} [options.theme='light']
   * @param {'sm'|'md'|'lg'} [options.miniSize='md']
   * @param {'arrows'|'arrows-with-hints'|'keyboard'|'both'} [options.chrome='arrows']
   * @param {'slide'|'fade'|'cut'} [options.transition='slide']
   * @param {string} [options.label='SPINE+RIB']
   * @param {boolean} [options.enableKeys=true]
   * @param {(slide: object, theme: object) => HTMLElement} [options.renderSlide]
   * @param {(event: {type:string, pos:{y:number,x:number}}) => void} [options.onChange]
   */
  constructor(options) {
    if (!options || !options.container) {
      throw new Error('SpinRib: `container` option is required');
    }
    if (!Array.isArray(options.spines) || options.spines.length === 0) {
      throw new Error('SpinRib: `spines` option must be a non-empty array');
    }

    this.container = options.container;
    this.spines = options.spines;
    this.theme = options.theme || 'light';
    this.miniSize = options.miniSize || 'md';
    this.chrome = options.chrome || 'arrows';
    this.transition = options.transition || 'slide';
    this.label = options.label || 'SPINE+RIB';
    this.enableKeys = options.enableKeys !== false;
    this.renderSlide = options.renderSlide || null;
    this.onChange = options.onChange || null;

    this.slides = flatten(this.spines);
    this.pos = { y: 0, x: 0 };
    this.prev = null;
    this.animating = false;
    this._animTimer = null;

    injectStyles();
    this._mount();
    this._bindKeys();
    this._render();
  }

  // ── Public API ────────────────────────────────────────────────────
  moveBy(dx, dy) {
    const row = this.spines[this.pos.y];
    if (dy !== 0) {
      const ny = this.pos.y + dy;
      if (ny < 0 || ny >= this.spines.length) return;
      this._animateTo({ y: ny, x: 0 });
      return;
    }
    if (dx !== 0) {
      const nx = this.pos.x + dx;
      if (nx < -leftLen(row) || nx > rightLen(row)) return;
      this._animateTo({ y: this.pos.y, x: nx });
    }
  }

  jumpTo(y, x) {
    if (y === this.pos.y && x === this.pos.x) return;
    if (y < 0 || y >= this.spines.length) return;
    const r = this.spines[y];
    if (x < -leftLen(r) || x > rightLen(r)) return;
    this._animateTo({ y, x });
  }

  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    this.theme = theme;
    this._applyThemeVars();
    this._render();
  }

  setMiniSize(size) {
    if (!['sm', 'md', 'lg'].includes(size)) return;
    this.miniSize = size;
    this._render();
  }

  setChrome(chrome) {
    this.chrome = chrome;
    this._render();
  }

  setTransition(t) {
    if (!['slide', 'fade', 'cut'].includes(t)) return;
    this.transition = t;
  }

  destroy() {
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
    }
    if (this._animTimer) clearTimeout(this._animTimer);
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
  }

  // ── Internal ──────────────────────────────────────────────────────
  _mount() {
    this.root = el('div', { class: 'spr-root' });
    this._applyThemeVars();
    this.container.appendChild(this.root);
  }

  _applyThemeVars() {
    const t = THEME[this.theme];
    const map = {
      '--spr-bg': t.bg,
      '--spr-fg': t.fg,
      '--spr-fg-subtle': t.fgSubtle,
      '--spr-fg-faint': t.fgFaint,
      '--spr-border': t.border,
      '--spr-panel': t.panel,
      '--spr-panel-solid': t.panelSolid,
      '--spr-accent': t.accent,
      '--spr-arrow': t.arrow,
      '--spr-arrow-disabled': t.arrowDisabled,
      '--spr-mini-bg': t.miniBg,
      '--spr-mini-border': t.miniBorder,
      '--spr-grain': this.theme === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.022)',
      '--spr-panel-shadow': t.panelShadow,
    };
    for (const [k, v] of Object.entries(map)) {
      this.root.style.setProperty(k, v);
    }
    this.root.style.background = t.bg;
    this.root.style.color = t.fg;
  }

  _bindKeys() {
    this._keyHandler = (e) => {
      if (!this.enableKeys) return;
      const tgt = e.target;
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return;
      if (e.key === 'ArrowUp')    { this.moveBy(0, -1); e.preventDefault(); }
      if (e.key === 'ArrowDown')  { this.moveBy(0,  1); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { this.moveBy(-1, 0); e.preventDefault(); }
      if (e.key === 'ArrowRight') { this.moveBy(1,  0); e.preventDefault(); }
    };
    window.addEventListener('keydown', this._keyHandler);
  }

  _animateTo(next) {
    if (this._animTimer) clearTimeout(this._animTimer);
    this.prev = { ...this.pos };
    this.pos = next;
    this.animating = true;
    this._render();
    this._animTimer = setTimeout(() => {
      this.animating = false;
      this.prev = null;
      this._render();
    }, ANIM_DURATION_MS);
    if (this.onChange) this.onChange({ type: 'change', pos: { ...this.pos } });
  }

  _render() {
    this.root.innerHTML = '';

    const slide = findSlide(this.slides, this.pos.y, this.pos.x);
    const prevSlide = this.prev ? findSlide(this.slides, this.prev.y, this.prev.x) : null;

    this.root.appendChild(this._renderStage(slide, prevSlide));
    this.root.appendChild(this._renderHeader());

    const showArrows = this.chrome === 'arrows' || this.chrome === 'both' || this.chrome === 'arrows-with-hints';
    const showKeys = this.chrome === 'keyboard' || this.chrome === 'both';

    if (showArrows) {
      this._renderArrows(this.chrome === 'arrows-with-hints');
    }
    if (showKeys) {
      this.root.appendChild(this._renderKeyHints());
    }
    this.root.appendChild(this._renderMinimap());
  }

  _renderStage(slide, prevSlide) {
    const stage = el('div', { class: 'spr-stage' });
    const useTransition = this.transition;
    const hasPrev = prevSlide && useTransition !== 'cut' && this.animating;

    let dx = 0, dy = 0;
    if (hasPrev) {
      dx = slide.x - prevSlide.x;
      dy = slide.y - prevSlide.y;
    }
    const dirX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
    const dirY = dy > 0 ? 1 : dy < 0 ? -1 : 0;

    if (hasPrev) {
      const prevNode = this._renderSlide(prevSlide);
      prevNode.style.setProperty('--spr-dx', `${-dirX * 100}%`);
      prevNode.style.setProperty('--spr-dy', `${-dirY * 100}%`);
      prevNode.style.animation = useTransition === 'slide'
        ? `spr-prev-out ${ANIM_DURATION_MS}ms cubic-bezier(.7,0,.2,1) forwards`
        : `spr-fade-out ${ANIM_DURATION_MS}ms ease forwards`;
      stage.appendChild(prevNode);
    }

    const curNode = this._renderSlide(slide);
    curNode.style.setProperty('--spr-dx', `${dirX * 100}%`);
    curNode.style.setProperty('--spr-dy', `${dirY * 100}%`);
    if (this.animating && useTransition !== 'cut') {
      curNode.style.animation = useTransition === 'slide'
        ? `spr-cur-in ${ANIM_DURATION_MS}ms cubic-bezier(.7,0,.2,1) forwards`
        : `spr-fade-in ${ANIM_DURATION_MS}ms ease forwards`;
    }
    stage.appendChild(curNode);
    return stage;
  }

  _renderSlide(slide) {
    if (this.renderSlide) {
      const node = this.renderSlide(slide, THEME[this.theme]);
      node.classList.add('spr-slide');
      return node;
    }
    const hue = this.theme === 'dark' ? slide.hueDark : slide.hueLight;
    const glyph = slide.isCover ? '◆' : (slide.x === 0 ? '●' : (slide.x < 0 ? '◀' : '▶'));
    const ribLabel = slide.x === 0 ? 'SPINE' : (slide.x < 0 ? 'L-RIB' : 'R-RIB');

    return el('div', { class: 'spr-slide' }, [
      el('div', { class: 'spr-slide-image', style: { background: hue } }, [
        el('div', { class: 'spr-slide-image-meta' }, [
          el('div', { class: 'spr-slide-image-coord' }, slide.coord),
          el('div', { class: 'spr-slide-image-glyph' }, glyph),
        ]),
        el('div', { class: 'spr-slide-image-tag' }, `image · ${slide.tag}`),
      ]),
      el('div', { class: 'spr-slide-text' }, [
        el('div', { class: 'spr-slide-kicker' }, `${slide.kicker} · ${slide.spine}`),
        el('h1', { class: 'spr-slide-title' }, slide.title),
        el('div', { class: 'spr-slide-footer' }, [
          el('span', {}, 'SpinRib · No. 014'),
          el('span', {}, `${ribLabel} ${Math.abs(slide.x) || 0}`),
        ]),
      ]),
    ]);
  }

  _renderHeader() {
    return el('div', { class: 'spr-header' }, [
      el('span', { class: 'spr-header-brand' }, 'SpinRib'),
      el('span', { class: 'spr-header-sep' }, '·'),
      el('span', { class: 'spr-header-label' }, this.label),
    ]);
  }

  _renderArrows(withHints) {
    const row = this.spines[this.pos.y];
    const flags = {
      up:    this.pos.y > 0,
      down:  this.pos.y < this.spines.length - 1,
      left:  this.pos.x > -leftLen(row),
      right: this.pos.x <  rightLen(row),
    };
    const dirs = ['up', 'down', 'left', 'right'];
    const moves = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    for (const dir of dirs) {
      const enabled = flags[dir];
      const btn = el('button', {
        class: `spr-arrow spr-arrow-${dir}`,
        'aria-label': `move ${dir}`,
        disabled: !enabled,
        onclick: () => { if (enabled) this.moveBy(...moves[dir]); },
      });
      btn.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">${ARROW_SVG[dir]}</svg>`;
      if (withHints) {
        const hint = el('span', { class: 'spr-arrow-hint' }, ARROW_LABEL[dir]);
        btn.appendChild(hint);
      }
      this.root.appendChild(btn);
    }
  }

  _renderKeyHints() {
    const row = this.spines[this.pos.y];
    const can = {
      up:    this.pos.y > 0,
      down:  this.pos.y < this.spines.length - 1,
      left:  this.pos.x > -leftLen(row),
      right: this.pos.x <  rightLen(row),
    };
    const cell = (key, active) =>
      el('div', { class: `spr-keyhints-cell${active ? ' spr-active' : ''}` }, key);
    const empty = () => el('div', { class: 'spr-keyhints-empty' });
    return el('div', { class: 'spr-keyhints' }, [
      empty(), cell('↑', can.up), empty(),
      cell('←', can.left), cell('↓', can.down), cell('→', can.right),
    ]);
  }

  _renderMinimap() {
    const s = MINI_SIZES[this.miniSize];
    const t = THEME[this.theme];
    const maxL = Math.max(...this.spines.map(leftLen));
    const maxR = Math.max(...this.spines.map(rightLen));
    const totalCols = maxL + 1 + maxR;
    const W = totalCols * s.unit + (totalCols - 1) * s.gap;
    const H = this.spines.length * s.unit + (this.spines.length - 1) * s.gap;

    const svg = svgEl('svg', {
      width: W, height: H,
      viewBox: `${-2} ${-2} ${W + 4} ${H + 4}`,
      class: 'spr-minimap-svg',
    });

    this.spines.forEach((row, y) => {
      const cy = y * (s.unit + s.gap) + s.unit / 2;
      for (let xOff = -leftLen(row); xOff <= rightLen(row); xOff++) {
        const colIdx = maxL + xOff;
        const cx = colIdx * (s.unit + s.gap) + s.unit / 2;
        const isActive = (y === this.pos.y && xOff === this.pos.x);
        const isOnSpine = xOff === 0;
        const fill = isActive ? t.fg : (isOnSpine ? t.miniRib : t.miniRibFaint);
        const rect = svgEl('rect', {
          x: cx - s.unit / 2, y: cy - s.unit / 2,
          width: s.unit, height: s.unit,
          rx: Math.max(1, s.unit / 6),
          fill,
          class: 'spr-minimap-cell',
        });
        const title = svgEl('title');
        title.textContent = `${row.kicker} · row ${y + 1}, offset ${xOff}`;
        rect.appendChild(title);
        rect.addEventListener('click', () => this.jumpTo(y, xOff));
        rect.addEventListener('mouseenter', () => {
          if (!isActive) rect.setAttribute('fill', t.miniRib);
        });
        rect.addEventListener('mouseleave', () => {
          if (!isActive) rect.setAttribute('fill', isOnSpine ? t.miniRib : t.miniRibFaint);
        });
        svg.appendChild(rect);
      }
    });

    const head = el('div', {
      class: 'spr-minimap-head',
      style: { fontSize: `${s.fontSize}px`, marginBottom: `${s.pad - 2}px` },
    }, [
      el('span', {}, 'SPINE / RIB'),
      el('span', { class: 'spr-minimap-head-current' },
        `${this.spines[this.pos.y].kicker.slice(0, 4)} · ${this.pos.x === 0 ? 'SPN' : (this.pos.x < 0 ? `L${-this.pos.x}` : `R${this.pos.x}`)}`),
    ]);

    const children = [head, svg];
    if (this.miniSize !== 'sm') {
      const curRow = this.spines[this.pos.y];
      const foot = el('div', {
        class: 'spr-minimap-foot',
        style: { fontSize: `${s.fontSize}px`, marginTop: `${s.pad - 2}px` },
      }, [
        el('span', {}, `row ${this.pos.y + 1}/${this.spines.length}`),
        el('span', {}, `${leftLen(curRow)}L · ${rightLen(curRow)}R`),
      ]);
      children.push(foot);
    }

    return el('div', {
      class: 'spr-minimap',
      style: { padding: `${s.pad}px` },
    }, children);
  }
}
