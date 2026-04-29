import { THEME, MINI_SIZES, ANIM_DURATION_MS } from './theme.js';
import { injectStyles } from './styles.js';

const ARROW_SVG = {
  up:    '<polygon points="14,4 24,18 4,18" />',
  down:  '<polygon points="4,6 24,6 14,20" />',
  left:  '<polygon points="18,4 4,14 18,24" />',
  right: '<polygon points="6,4 20,14 6,24" />',
};
const ARROW_LABEL = { up: '↑', down: '↓', left: '←', right: '→' };

// Rib lengths are derived from the array. The library does not look at
// any other field on the row — kicker, hue, etc. are consumer concerns.
function leftLen(row)  { return row && row.items && row.items.left  ? row.items.left.length  : 0; }
function rightLen(row) { return row && row.items && row.items.right ? row.items.right.length : 0; }

// Resolve (y, x) to the raw value the consumer placed there.
// Returns null when the coordinate is out of bounds.
function getDataAt(spines, y, x) {
  const row = spines[y];
  if (!row) return null;
  if (x === 0) return row.cover ?? null;
  if (x < 0) {
    const i = -x - 1;
    return row.items && row.items.left ? row.items.left[i] ?? null : null;
  }
  const i = x - 1;
  return row.items && row.items.right ? row.items.right[i] ?? null : null;
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
   * Create a 2D spine-and-rib slider. The library is content-agnostic:
   * it only inspects the structure (cover + items.{left, right}) and
   * delegates slide rendering to the user-supplied `renderSlide`.
   *
   * @param {object} options
   * @param {HTMLElement} options.container — host element to mount into
   * @param {Array<{cover:any, items?:{left?:any[], right?:any[]}}>} options.spines
   * @param {(data:any, ctx:{y:number,x:number,isCover:boolean,theme:'light'|'dark'}) => HTMLElement} options.renderSlide
   * @param {'light'|'dark'} [options.theme='light']
   * @param {'sm'|'md'|'lg'} [options.miniSize='md']
   * @param {'arrows'|'arrows-with-hints'|'keyboard'|'both'} [options.chrome='arrows']
   * @param {'slide'|'fade'|'cut'} [options.transition='slide']
   * @param {boolean} [options.enableKeys=true]
   * @param {(row:any, y:number) => string} [options.rowLabel] — mini-map current-row label
   * @param {(event:{type:string, pos:{y:number,x:number}, data:any}) => void} [options.onChange]
   */
  constructor(options) {
    if (!options || !options.container) {
      throw new Error('SpinRib: `container` option is required');
    }
    if (!Array.isArray(options.spines) || options.spines.length === 0) {
      throw new Error('SpinRib: `spines` option must be a non-empty array');
    }
    if (typeof options.renderSlide !== 'function') {
      throw new Error('SpinRib: `renderSlide` callback is required (data, ctx) => HTMLElement');
    }
    options.spines.forEach((row, y) => {
      if (!row || row.cover === undefined || row.cover === null) {
        throw new Error(`SpinRib: spine row ${y} is missing a cover`);
      }
    });

    this.container = options.container;
    this.spines = options.spines;
    this.renderSlideCb = options.renderSlide;
    this.theme = options.theme || 'light';
    this.miniSize = options.miniSize || 'md';
    this.chrome = options.chrome || 'arrows';
    this.transition = options.transition || 'slide';
    this.enableKeys = options.enableKeys !== false;
    this.rowLabel = options.rowLabel || ((_row, y) => `Row ${y + 1}`);
    this.onChange = options.onChange || null;

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

  /** Returns the raw data at the current position. */
  currentData() { return getDataAt(this.spines, this.pos.y, this.pos.x); }

  /** Returns { y, x, isCover }. */
  currentPos() { return { y: this.pos.y, x: this.pos.x, isCover: this.pos.x === 0 }; }

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
    this.root.dataset.theme = this.theme;
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
      '--spr-mini-rib': t.miniRib,
      '--spr-mini-rib-faint': t.miniRibFaint,
      '--spr-panel-shadow': t.panelShadow,
    };
    for (const [k, v] of Object.entries(map)) {
      this.root.style.setProperty(k, v);
    }
    this.root.style.background = t.bg;
    this.root.style.color = t.fg;
    this.root.dataset.theme = this.theme;
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
    if (this.onChange) {
      this.onChange({ type: 'change', pos: { ...this.pos }, data: this.currentData() });
    }
  }

  _render() {
    this.root.innerHTML = '';

    this.root.appendChild(this._renderStage());

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

  _renderStage() {
    const stage = el('div', { class: 'spr-stage' });
    const useTransition = this.transition;
    const hasPrev = !!this.prev && useTransition !== 'cut' && this.animating;

    let dx = 0, dy = 0;
    if (hasPrev) {
      dx = this.pos.x - this.prev.x;
      dy = this.pos.y - this.prev.y;
    }
    const dirX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
    const dirY = dy > 0 ? 1 : dy < 0 ? -1 : 0;

    if (hasPrev) {
      const prevWrap = this._renderSlideWrapper(this.prev.y, this.prev.x);
      prevWrap.style.setProperty('--spr-dx', `${-dirX * 100}%`);
      prevWrap.style.setProperty('--spr-dy', `${-dirY * 100}%`);
      prevWrap.style.animation = useTransition === 'slide'
        ? `spr-prev-out ${ANIM_DURATION_MS}ms cubic-bezier(.7,0,.2,1) forwards`
        : `spr-fade-out ${ANIM_DURATION_MS}ms ease forwards`;
      stage.appendChild(prevWrap);
    }

    const curWrap = this._renderSlideWrapper(this.pos.y, this.pos.x);
    curWrap.style.setProperty('--spr-dx', `${dirX * 100}%`);
    curWrap.style.setProperty('--spr-dy', `${dirY * 100}%`);
    if (this.animating && useTransition !== 'cut') {
      curWrap.style.animation = useTransition === 'slide'
        ? `spr-cur-in ${ANIM_DURATION_MS}ms cubic-bezier(.7,0,.2,1) forwards`
        : `spr-fade-in ${ANIM_DURATION_MS}ms ease forwards`;
    }
    stage.appendChild(curWrap);
    return stage;
  }

  _renderSlideWrapper(y, x) {
    const data = getDataAt(this.spines, y, x);
    const inner = this.renderSlideCb(data, {
      y, x,
      isCover: x === 0,
      theme: this.theme,
    });
    const wrap = el('div', { class: 'spr-slide' });
    if (inner instanceof Node) wrap.appendChild(inner);
    return wrap;
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

    const curRow = this.spines[this.pos.y];
    const curRowLabel = String(this.rowLabel(curRow, this.pos.y) || '');
    const xLabel = this.pos.x === 0 ? 'SPN' : (this.pos.x < 0 ? `L${-this.pos.x}` : `R${this.pos.x}`);

    const head = el('div', {
      class: 'spr-minimap-head',
      style: { fontSize: `${s.fontSize}px`, marginBottom: `${s.pad - 2}px` },
    }, [
      el('span', {}, 'SPINE / RIB'),
      el('span', { class: 'spr-minimap-head-current' }, `${curRowLabel} · ${xLabel}`),
    ]);

    const children = [head, svg];
    if (this.miniSize !== 'sm') {
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
