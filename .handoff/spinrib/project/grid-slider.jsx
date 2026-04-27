// SpinRib · Spine + Ribs slider
// Vertical spine of rows; each row has ribs of UNEVEN length extending
// left and right. ↑↓ moves along spine (to the spine/cover slide of the
// next row). ←→ traverses ribs of the current row. Mini-map renders the
// skeleton: central vertical spine + horizontal rib branches.

const { useState, useEffect, useRef, useCallback } = React;

// ── Hook: spine+rib navigation ───────────────────────────────────────
function useSpineRib({ spines, transition = 'slide' }) {
  const [pos, setPos] = useState({ y: 0, x: 0 }); // start on spine of row 0
  const [prev, setPrev] = useState(null);
  const [animating, setAnimating] = useState(false);
  const animRef = useRef(null);

  const row = spines[pos.y];
  const canL = pos.x > -row.leftCount;
  const canR = pos.x <  row.rightCount;
  const canU = pos.y > 0;
  const canD = pos.y < spines.length - 1;

  const animate = (next) => {
    if (animRef.current) clearTimeout(animRef.current);
    setPrev(pos);
    setPos(next);
    setAnimating(true);
    animRef.current = setTimeout(() => {
      setAnimating(false);
      setPrev(null);
    }, 480);
  };

  const moveBy = useCallback((dx, dy) => {
    if (dy !== 0) {
      const ny = pos.y + dy;
      if (ny < 0 || ny >= spines.length) return;
      // jumping rows always lands on the spine (x=0)
      animate({ y: ny, x: 0 });
      return;
    }
    if (dx !== 0) {
      const nx = pos.x + dx;
      if (nx < -row.leftCount || nx > row.rightCount) return;
      animate({ y: pos.y, x: nx });
    }
  }, [pos, row.leftCount, row.rightCount, spines.length]);

  const jumpTo = useCallback((y, x) => {
    if (y === pos.y && x === pos.x) return;
    if (y < 0 || y >= spines.length) return;
    const r = spines[y];
    if (x < -r.leftCount || x > r.rightCount) return;
    animate({ y, x });
  }, [pos, spines]);

  return { pos, prev, animating, canU, canD, canL, canR, moveBy, jumpTo };
}

// ── Theme tokens ─────────────────────────────────────────────────────
const THEME = {
  light: {
    bg: '#f6f5f1',
    fg: '#15140f',
    fgSubtle: 'rgba(21,20,15,0.55)',
    fgFaint: 'rgba(21,20,15,0.18)',
    border: 'rgba(21,20,15,0.14)',
    panel: 'rgba(255,254,250,0.78)',
    panelSolid: '#ffffff',
    accent: '#d4543a',
    arrow: 'rgba(21,20,15,0.85)',
    arrowDisabled: 'rgba(21,20,15,0.16)',
    miniRib: 'rgba(21,20,15,0.32)',
    miniRibFaint: 'rgba(21,20,15,0.18)',
    miniBg: 'rgba(255,254,250,0.85)',
    miniBorder: 'rgba(21,20,15,0.12)',
  },
  dark: {
    bg: '#0e0d0a',
    fg: '#f0eee6',
    fgSubtle: 'rgba(240,238,230,0.55)',
    fgFaint: 'rgba(240,238,230,0.18)',
    border: 'rgba(240,238,230,0.14)',
    panel: 'rgba(20,19,15,0.75)',
    panelSolid: '#191815',
    accent: '#e26a4f',
    arrow: 'rgba(240,238,230,0.85)',
    arrowDisabled: 'rgba(240,238,230,0.16)',
    miniRib: 'rgba(240,238,230,0.40)',
    miniRibFaint: 'rgba(240,238,230,0.20)',
    miniBg: 'rgba(20,19,15,0.85)',
    miniBorder: 'rgba(240,238,230,0.14)',
  },
};

// ── Slide content ────────────────────────────────────────────────────
function SlideContent({ slide, theme }) {
  const t = THEME[theme];
  const hue = theme === 'dark' ? slide.hueDark : slide.hueLight;
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'grid', gridTemplateColumns: '1.15fr 1fr',
      background: t.bg, color: t.fg,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ position: 'relative', background: hue, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(135deg, transparent 0 28px, ${theme === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.022)'} 28px 29px)`,
        }} />
        <div style={{
          position: 'absolute', top: 24, left: 24,
          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          color: t.fgSubtle,
        }}>
          <div style={{ marginBottom: 4 }}>{slide.coord}</div>
          <div style={{
            fontSize: 64, fontWeight: 300, letterSpacing: '-0.04em',
            color: t.fg, lineHeight: 1, fontFamily: 'inherit',
          }}>
            {slide.isCover ? '◆' : (slide.x === 0 ? '●' : (slide.x < 0 ? '◀' : '▶'))}
          </div>
        </div>
        <div style={{
          position: 'absolute', bottom: 24, left: 24,
          fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
          fontFamily: 'ui-monospace, monospace',
          padding: '6px 10px',
          border: `1px dashed ${t.fgSubtle}`,
          color: t.fgSubtle,
        }}>
          image · {slide.tag}
        </div>
      </div>

      <div style={{
        padding: '56px 48px 48px',
        display: 'flex', flexDirection: 'column', gap: 18,
        overflow: 'hidden',
      }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: t.fgSubtle, fontFamily: 'ui-monospace, monospace',
        }}>
          {slide.kicker} · {slide.spine}
        </div>
        <h1 style={{
          fontSize: 'clamp(30px, 3.6vw, 50px)', lineHeight: 1.05,
          letterSpacing: '-0.02em', fontWeight: 500,
          margin: 0, textWrap: 'balance',
          fontFamily: '"Fraunces", "Times New Roman", serif',
        }}>
          {slide.title}
        </h1>
        <div style={{
          marginTop: 'auto',
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: t.fgSubtle, fontFamily: 'ui-monospace, monospace',
          paddingTop: 16, borderTop: `1px solid ${t.border}`,
        }}>
          <span>SpinRib · No. 014</span>
          <span>{slide.x === 0 ? 'SPINE' : (slide.x < 0 ? 'L-RIB' : 'R-RIB')} {Math.abs(slide.x) || 0}</span>
        </div>
      </div>
    </div>
  );
}

// ── Stage with directional transitions ──────────────────────────────
function Stage({ slide, prevSlide, animating, transition, theme, frozenAt }) {
  const t = THEME[theme];
  const hasPrev = prevSlide && transition !== 'cut';
  let dx = 0, dy = 0;
  if (hasPrev) {
    dx = slide.x - prevSlide.x;
    dy = slide.y - prevSlide.y;
  }
  // when jumping rows we land on x=0; the X delta still encodes lateral motion
  const dirX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
  const dirY = dy > 0 ? 1 : dy < 0 ? -1 : 0;

  if (frozenAt !== undefined) {
    const k = frozenAt;
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: t.bg }}>
        {prevSlide && (
          <div style={{
            position: 'absolute', inset: 0,
            transform: transition === 'slide' ? `translate(${-dirX * 100 * k}%, ${-dirY * 100 * k}%)` : 'none',
            opacity: transition === 'fade' ? 1 - k : 1,
          }}>
            <SlideContent slide={prevSlide} theme={theme} />
          </div>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          transform: transition === 'slide' ? `translate(${dirX * 100 * (1 - k)}%, ${dirY * 100 * (1 - k)}%)` : 'none',
          opacity: transition === 'fade' ? k : 1,
        }}>
          <SlideContent slide={slide} theme={theme} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: t.bg }}>
      {hasPrev && animating && (
        <div key={`prev-${prevSlide.y}-${prevSlide.x}`} style={{
          position: 'absolute', inset: 0,
          animation: transition === 'slide'
            ? `spr-prev-out 480ms cubic-bezier(.7,0,.2,1) forwards`
            : `spr-fade-out 480ms ease forwards`,
          ['--dx']: -dirX * 100 + '%', ['--dy']: -dirY * 100 + '%',
        }}>
          <SlideContent slide={prevSlide} theme={theme} />
        </div>
      )}
      <div key={`cur-${slide.y}-${slide.x}`} style={{
        position: 'absolute', inset: 0,
        animation: animating ? (transition === 'slide'
          ? `spr-cur-in 480ms cubic-bezier(.7,0,.2,1) forwards`
          : transition === 'fade' ? `spr-fade-in 480ms ease forwards` : 'none') : 'none',
        ['--dx']: dirX * 100 + '%', ['--dy']: dirY * 100 + '%',
      }}>
        <SlideContent slide={slide} theme={theme} />
      </div>
    </div>
  );
}

// ── Arrow button ────────────────────────────────────────────────────
function ArrowBtn({ direction, disabled, onClick, theme, hint }) {
  const t = THEME[theme];
  const positions = {
    up:    { top: 18,    left: '50%', transform: 'translateX(-50%)' },
    down:  { bottom: 18, left: '50%', transform: 'translateX(-50%)' },
    left:  { left: 18,   top: '50%',  transform: 'translateY(-50%)' },
    right: { right: 18,  top: '50%',  transform: 'translateY(-50%)' },
  };
  const arrows = {
    up: <polygon points="14,4 24,18 4,18" />,
    down: <polygon points="4,6 24,6 14,20" />,
    left: <polygon points="18,4 4,14 18,24" />,
    right: <polygon points="6,4 20,14 6,24" />,
  };
  const labels = { up: '↑', down: '↓', left: '←', right: '→' };
  return (
    <button
      onClick={onClick} disabled={disabled} aria-label={`move ${direction}`}
      style={{
        position: 'absolute', ...positions[direction],
        width: 44, height: 44, background: 'transparent', border: 'none', padding: 0,
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? t.arrowDisabled : t.arrow,
        opacity: disabled ? 0.5 : 1,
        transition: 'color .2s, opacity .2s, transform .15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = positions[direction].transform + ' scale(1.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = positions[direction].transform; }}
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">{arrows[direction]}</svg>
      {hint && (
        <span style={{
          position: 'absolute',
          [direction === 'up' ? 'bottom' : direction === 'down' ? 'top' : direction === 'left' ? 'right' : 'left']: '110%',
          fontSize: 10, letterSpacing: '0.16em', fontFamily: 'ui-monospace, monospace',
          color: t.fgSubtle, whiteSpace: 'nowrap', padding: '2px 6px',
          border: `1px solid ${t.border}`, borderRadius: 3, background: t.panelSolid,
        }}>{labels[direction]}</span>
      )}
    </button>
  );
}

// ── Keyboard hint cluster ──────────────────────────────────────────
function KeyboardHints({ theme, canU, canD, canL, canR }) {
  const t = THEME[theme];
  const keyStyle = (active) => ({
    width: 32, height: 32,
    border: `1px solid ${active ? 'currentColor' : t.border}`,
    color: active ? t.fg : t.fgSubtle,
    background: active ? t.panelSolid : 'transparent',
    borderRadius: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontFamily: 'ui-monospace, monospace', fontWeight: 500,
    transition: 'all .15s',
  });
  return (
    <div style={{
      position: 'absolute', top: 18, right: 18, zIndex: 5,
      display: 'grid', gridTemplateColumns: 'repeat(3, 32px)', gridTemplateRows: 'repeat(2, 32px)',
      gap: 4, padding: 10, background: t.panel,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${t.border}`, borderRadius: 8,
    }}>
      <div /><div style={{ ...keyStyle(canU), opacity: canU ? 1 : 0.4 }}>↑</div><div />
      <div style={{ ...keyStyle(canL), opacity: canL ? 1 : 0.4 }}>←</div>
      <div style={{ ...keyStyle(canD), opacity: canD ? 1 : 0.4 }}>↓</div>
      <div style={{ ...keyStyle(canR), opacity: canR ? 1 : 0.4 }}>→</div>
    </div>
  );
}

// ── Spine+Rib mini-map (the actual SpinRib visual) ─────────────────
function SpineRibMap({ spines, pos, onJump, size = 'md', theme }) {
  const t = THEME[theme];
  const SZ = {
    sm: { unit: 5,  gap: 5,  pad: 8,  spineW: 1.5, ribH: 1.5, fontSize: 9  },
    md: { unit: 9,  gap: 8,  pad: 12, spineW: 2,   ribH: 2,   fontSize: 10 },
    lg: { unit: 13, gap: 12, pad: 16, spineW: 2.5, ribH: 2.5, fontSize: 11 },
  };
  const s = SZ[size] || SZ.md;

  // figure out the widest left/right arm so we know layout extent
  const maxL = Math.max(...spines.map(r => r.leftCount));
  const maxR = Math.max(...spines.map(r => r.rightCount));
  const totalCols = maxL + 1 + maxR; // +1 for the spine column

  // canvas width / height
  const W = totalCols * s.unit + (totalCols - 1) * s.gap;
  const H = spines.length * s.unit + (spines.length - 1) * s.gap;

  // x position of the spine column (centered along its column)
  const spineCx = maxL * (s.unit + s.gap) + s.unit / 2;

  // build cells
  const cells = [];
  spines.forEach((row, y) => {
    const cy = y * (s.unit + s.gap) + s.unit / 2;
    // each slide on this rib (incl. spine slide)
    for (let xOff = -row.leftCount; xOff <= row.rightCount; xOff++) {
      const colIdx = maxL + xOff;
      const cx = colIdx * (s.unit + s.gap) + s.unit / 2;
      const isActive = (y === pos.y && xOff === pos.x);
      const isOnSpine = xOff === 0;
      const cell = (
        <g key={`cell-${y}-${xOff}`}>
          <rect
            x={cx - s.unit / 2} y={cy - s.unit / 2}
            width={s.unit} height={s.unit}
            rx={Math.max(1, s.unit / 6)}
            fill={isActive ? t.fg : (isOnSpine ? t.miniRib : t.miniRibFaint)}
            stroke="transparent"
            style={{ cursor: 'pointer', transition: 'fill .15s' }}
            onClick={() => onJump(y, xOff)}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.setAttribute('fill', t.miniRib); }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.setAttribute('fill', isOnSpine ? t.miniRib : t.miniRibFaint); }}
          >
            <title>{`${row.kicker} · row ${y + 1}, offset ${xOff}`}</title>
          </rect>
        </g>
      );
      cells.push(cell);
    }
  });

  return (
    <div style={{
      position: 'absolute', left: 18, bottom: 18, zIndex: 5,
      padding: s.pad,
      background: t.miniBg,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${t.miniBorder}`, borderRadius: 8,
      fontFamily: 'ui-monospace, "SF Mono", monospace',
      color: t.fg,
      boxShadow: theme === 'dark' ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontSize: s.fontSize, letterSpacing: '0.16em', textTransform: 'uppercase',
        marginBottom: s.pad - 2, color: t.fgSubtle, gap: 12,
      }}>
        <span>SPINE / RIB</span>
        <span style={{ color: t.fg, fontWeight: 500 }}>
          {spines[pos.y].kicker.slice(0,4)} · {pos.x === 0 ? 'SPN' : (pos.x < 0 ? `L${-pos.x}` : `R${pos.x}`)}
        </span>
      </div>

      <svg
        width={W} height={H}
        viewBox={`${-2} ${-2} ${W + 4} ${H + 4}`}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {cells}
      </svg>

      {size !== 'sm' && (
        <div style={{
          marginTop: s.pad - 2,
          fontSize: s.fontSize, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: t.fgSubtle,
          display: 'flex', justifyContent: 'space-between', gap: 12,
        }}>
          <span>row {pos.y + 1}/{spines.length}</span>
          <span>{spines[pos.y].leftCount}L · {spines[pos.y].rightCount}R</span>
        </div>
      )}
    </div>
  );
}

// ── Brand chip ──────────────────────────────────────────────────────
function StageHeader({ theme, label }) {
  const t = THEME[theme];
  return (
    <div style={{
      position: 'absolute', top: 18, left: 18, zIndex: 5,
      padding: '8px 12px', background: t.panel,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${t.border}`, borderRadius: 8,
      fontFamily: 'ui-monospace, "SF Mono", monospace',
      fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
      color: t.fg, display: 'flex', gap: 12, alignItems: 'center',
    }}>
      <span style={{ fontWeight: 600, letterSpacing: '0.04em' }}>SpinRib</span>
      <span style={{ color: t.fgSubtle }}>·</span>
      <span style={{ color: t.fgSubtle }}>{label}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
function GridSlider2D({
  theme = 'light', miniSize = 'md', chrome = 'arrows',
  transition = 'slide', frozenAt, frozenFrom,
  label = 'SPINE+RIB', enableKeys = true,
  containerW = 1280, containerH = 720,
}) {
  const spines = window.SPINES;
  const { pos, prev, animating, canU, canD, canL, canR, moveBy, jumpTo } =
    useSpineRib({ spines, transition });

  const t = THEME[theme];

  const slide = window.findSlide(pos.y, pos.x);
  const prevSlide = prev ? window.findSlide(prev.y, prev.x) : null;

  useEffect(() => {
    if (!enableKeys) return;
    const onKey = (e) => {
      const tgt = e.target;
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return;
      if (e.key === 'ArrowUp')    { moveBy(0, -1); e.preventDefault(); }
      if (e.key === 'ArrowDown')  { moveBy(0,  1); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { moveBy(-1, 0); e.preventDefault(); }
      if (e.key === 'ArrowRight') { moveBy(1,  0); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enableKeys, moveBy]);

  // Frozen mode — render snapshot of a fixed transition pair
  let displaySlide = slide, displayPrev = prevSlide;
  if (frozenAt !== undefined && frozenFrom) {
    displayPrev = window.findSlide(frozenFrom.y, frozenFrom.x);
    displaySlide = window.findSlide(frozenFrom.y, frozenFrom.x + 1) || displayPrev;
  }

  return (
    <div style={{
      position: 'relative', width: containerW, height: containerH,
      background: t.bg, overflow: 'hidden', color: t.fg,
    }}>
      <Stage
        slide={displaySlide} prevSlide={displayPrev}
        animating={animating || frozenAt !== undefined}
        transition={transition} theme={theme} frozenAt={frozenAt}
      />

      <StageHeader theme={theme} label={label} />

      {(chrome === 'arrows' || chrome === 'both' || chrome === 'arrows-with-hints') && (
        <>
          <ArrowBtn direction="up"    disabled={!canU} onClick={() => moveBy(0, -1)} theme={theme} hint={chrome === 'arrows-with-hints'} />
          <ArrowBtn direction="down"  disabled={!canD} onClick={() => moveBy(0,  1)} theme={theme} hint={chrome === 'arrows-with-hints'} />
          <ArrowBtn direction="left"  disabled={!canL} onClick={() => moveBy(-1, 0)} theme={theme} hint={chrome === 'arrows-with-hints'} />
          <ArrowBtn direction="right" disabled={!canR} onClick={() => moveBy(1,  0)} theme={theme} hint={chrome === 'arrows-with-hints'} />
        </>
      )}

      {(chrome === 'keyboard' || chrome === 'both') && (
        <KeyboardHints theme={theme} canU={canU} canD={canD} canL={canL} canR={canR} />
      )}

      <SpineRibMap spines={spines} pos={pos} onJump={jumpTo} size={miniSize} theme={theme} />

      {frozenAt !== undefined && (
        <div style={{
          position: 'absolute', bottom: 18, right: 18, zIndex: 6,
          padding: '8px 12px', background: t.panel,
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${t.border}`, borderRadius: 8,
          fontFamily: 'ui-monospace, monospace',
          fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: t.fg, display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{ color: t.accent, fontWeight: 600 }}>● TRANSITION</span>
          <span style={{ color: t.fgSubtle }}>t = {(frozenAt * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

// keyframes
if (typeof document !== 'undefined' && !document.getElementById('spr-2d-anim')) {
  const s = document.createElement('style');
  s.id = 'spr-2d-anim';
  s.textContent = `
    @keyframes spr-prev-out { from { transform: translate(0,0); } to { transform: translate(var(--dx), var(--dy)); } }
    @keyframes spr-cur-in   { from { transform: translate(var(--dx), var(--dy)); } to { transform: translate(0,0); } }
    @keyframes spr-fade-in  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spr-fade-out { from { opacity: 1; } to { opacity: 0; } }
  `;
  document.head.appendChild(s);
}

window.GridSlider2D = GridSlider2D;
