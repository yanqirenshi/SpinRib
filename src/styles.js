const STYLE_ID = 'spinrib-styles';

export const STYLES = `
.spr-root {
  position: relative;
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

.spr-slide {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  will-change: transform, opacity;
}

.spr-slide-image {
  position: relative;
  overflow: hidden;
}
.spr-slide-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    135deg,
    transparent 0 28px,
    var(--spr-grain) 28px 29px
  );
  pointer-events: none;
}
.spr-slide-image-meta {
  position: absolute;
  top: 24px;
  left: 24px;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-family: ui-monospace, "SF Mono", monospace;
  color: var(--spr-fg-subtle);
  z-index: 1;
}
.spr-slide-image-coord { margin-bottom: 4px; }
.spr-slide-image-glyph {
  font-size: 64px;
  font-weight: 300;
  letter-spacing: -0.04em;
  color: var(--spr-fg);
  line-height: 1;
}
.spr-slide-image-tag {
  position: absolute;
  bottom: 24px;
  left: 24px;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: ui-monospace, monospace;
  padding: 6px 10px;
  border: 1px dashed var(--spr-fg-subtle);
  color: var(--spr-fg-subtle);
  z-index: 1;
}

.spr-slide-text {
  padding: 56px 48px 48px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: hidden;
  background: var(--spr-bg);
  color: var(--spr-fg);
}
.spr-slide-kicker {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--spr-fg-subtle);
  font-family: ui-monospace, monospace;
}
.spr-slide-title {
  font-size: clamp(30px, 3.6vw, 50px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-weight: 500;
  margin: 0;
  text-wrap: balance;
  font-family: "Fraunces", "Times New Roman", serif;
}
.spr-slide-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--spr-fg-subtle);
  font-family: ui-monospace, monospace;
  padding-top: 16px;
  border-top: 1px solid var(--spr-border);
}

.spr-header {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 5;
  padding: 8px 12px;
  background: var(--spr-panel);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid var(--spr-border);
  border-radius: 8px;
  font-family: ui-monospace, "SF Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--spr-fg);
  display: flex;
  gap: 12px;
  align-items: center;
}
.spr-header-brand { font-weight: 600; letter-spacing: 0.04em; }
.spr-header-sep { color: var(--spr-fg-subtle); }
.spr-header-label { color: var(--spr-fg-subtle); }

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
.spr-minimap-cell {
  cursor: pointer;
  transition: fill .15s;
}

.spr-transition-badge {
  position: absolute;
  bottom: 18px;
  right: 18px;
  z-index: 6;
  padding: 8px 12px;
  background: var(--spr-panel);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid var(--spr-border);
  border-radius: 8px;
  font-family: ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--spr-fg);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.spr-transition-badge-tag { color: var(--spr-accent); font-weight: 600; }
.spr-transition-badge-t { color: var(--spr-fg-subtle); }

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
