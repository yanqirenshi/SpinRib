// Library-only styles. The slide content is rendered by the consumer's
// renderSlide callback and brings its own styles. This stylesheet covers
// only the slider chrome: stage container, slide-position wrapper,
// arrows, mini-map, key-hint cluster, and transition animations.

const STYLE_ID = 'spinrib-styles';

export const STYLES = `
.spr-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.spr-root *, .spr-root *::before, .spr-root *::after { box-sizing: border-box; }

.spr-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* Each rendered slide is wrapped in .spr-slide. The wrapper handles
   positioning and transition animation; its single child is whatever
   the consumer's renderSlide returned. Children should be sized to
   fill their parent (width: 100%, height: 100%). */
.spr-slide {
  position: absolute;
  inset: 0;
  will-change: transform, opacity;
}
.spr-slide > * {
  width: 100%;
  height: 100%;
}

.spr-arrow {
  position: absolute;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--spr-arrow);
  transition: color .2s, opacity .2s, transform .15s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}
.spr-arrow:disabled {
  cursor: default;
  color: var(--spr-arrow-disabled);
  opacity: 0.5;
}
.spr-arrow.spr-arrow-up    { top: 18px;    left: 50%; --spr-base-x: -50%; --spr-base-y: 0; }
.spr-arrow.spr-arrow-down  { bottom: 18px; left: 50%; --spr-base-x: -50%; --spr-base-y: 0; }
.spr-arrow.spr-arrow-left  { left: 18px;   top: 50%;  --spr-base-x: 0;    --spr-base-y: -50%; }
.spr-arrow.spr-arrow-right { right: 18px;  top: 50%;  --spr-base-x: 0;    --spr-base-y: -50%; }
.spr-arrow {
  transform: translate(var(--spr-base-x), var(--spr-base-y));
}
.spr-arrow:not(:disabled):hover {
  transform: translate(var(--spr-base-x), var(--spr-base-y)) scale(1.1);
}
.spr-arrow svg { display: block; }

.spr-arrow-hint {
  position: absolute;
  font-size: 10px;
  letter-spacing: 0.16em;
  font-family: ui-monospace, monospace;
  color: var(--spr-fg-subtle);
  white-space: nowrap;
  padding: 2px 6px;
  border: 1px solid var(--spr-border);
  border-radius: 3px;
  background: var(--spr-panel-solid);
}
.spr-arrow-up    .spr-arrow-hint { bottom: 110%; }
.spr-arrow-down  .spr-arrow-hint { top: 110%; }
.spr-arrow-left  .spr-arrow-hint { right: 110%; }
.spr-arrow-right .spr-arrow-hint { left: 110%; }

.spr-keyhints {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(3, 32px);
  grid-template-rows: repeat(2, 32px);
  gap: 4px;
  padding: 10px;
  background: var(--spr-panel);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid var(--spr-border);
  border-radius: 8px;
}
.spr-keyhints-cell {
  width: 32px;
  height: 32px;
  border: 1px solid var(--spr-border);
  color: var(--spr-fg-subtle);
  background: transparent;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-family: ui-monospace, monospace;
  font-weight: 500;
  transition: all .15s;
  opacity: 0.4;
}
.spr-keyhints-cell.spr-active {
  border-color: currentColor;
  color: var(--spr-fg);
  background: var(--spr-panel-solid);
  opacity: 1;
}
.spr-keyhints-empty { width: 32px; height: 32px; }

.spr-minimap {
  position: absolute;
  left: 18px;
  bottom: 18px;
  z-index: 5;
  background: var(--spr-mini-bg);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid var(--spr-mini-border);
  border-radius: 8px;
  font-family: ui-monospace, "SF Mono", monospace;
  color: var(--spr-fg);
  box-shadow: var(--spr-panel-shadow);
}
.spr-minimap-head, .spr-minimap-foot {
  display: flex;
  justify-content: space-between;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--spr-fg-subtle);
  gap: 12px;
}
.spr-minimap-head-current { color: var(--spr-fg); font-weight: 500; }
.spr-minimap-svg { display: block; overflow: visible; }
.spr-minimap-cell { cursor: pointer; transition: fill .15s; }

@keyframes spr-prev-out {
  from { transform: translate(0, 0); }
  to   { transform: translate(var(--spr-dx), var(--spr-dy)); }
}
@keyframes spr-cur-in {
  from { transform: translate(var(--spr-dx), var(--spr-dy)); }
  to   { transform: translate(0, 0); }
}
@keyframes spr-fade-in  { from { opacity: 0; } to { opacity: 1; } }
@keyframes spr-fade-out { from { opacity: 1; } to { opacity: 0; } }
`;

export function injectStyles(doc = document) {
  if (doc.getElementById(STYLE_ID)) return;
  const el = doc.createElement('style');
  el.id = STYLE_ID;
  el.textContent = STYLES;
  doc.head.appendChild(el);
}
