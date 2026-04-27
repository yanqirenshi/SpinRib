// Variant C — TAPE
// Most experimental. Slides advance with a tape-machine clatter:
// big rotating index "ribbon" along the right edge, slides peel from the
// edge, kinetic typography, mono-only — no serif at all.
// Minimap is the brick-wall pattern from the napkin sketch.

function VariantTape({ tweaks }) {
  const slides = window.SLIDES;
  const { index, progress, isDragging, bind, jumpTo, next, prev } =
    window.useCarousel({
      count: slides.length,
      speed: tweaks.speed,
      easing: tweaks.easing,
      snap: tweaks.snap,
    });

  const cur = slides[index];

  return (
    <div style={vtStyles.frame}>
      {/* Top status bar — terminal style */}
      <div style={vtStyles.statusBar}>
        <span>$ spinrib --variant=tape --slide={cur.no}</span>
        <span style={{ marginLeft: 'auto' }}>{cur.date}</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>{cur.issue}</span>
      </div>

      <div style={vtStyles.body}>
        {/* Stage */}
        <div
          {...bind}
          style={{ ...vtStyles.stage, cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div
            style={{
              ...vtStyles.track,
              transform: `translate3d(${-progress * 100}%, 0, 0)`,
              transition: isDragging ? 'none' : undefined,
            }}
          >
            {slides.map((s, i) => {
              const offset = i - progress; // -1..1 around active
              const opacity = Math.max(0, 1 - Math.abs(offset) * 1.2);
              return (
                <div key={s.no} style={vtStyles.slide}>
                  <div style={{ ...vtStyles.slideInner, opacity, transform: `translateX(${offset * 8}%)` }}>
                    <div style={vtStyles.col1}>
                      <div style={vtStyles.tickerLine}>
                        ▌ {s.kicker} ▌ {s.tag.toUpperCase()} ▌ pp.{s.pages} ▌
                      </div>
                      <h1 style={vtStyles.bigTitle}>{s.title}</h1>
                      <div style={vtStyles.standfirst}>&gt;&gt; {s.standfirst}</div>
                      <div style={vtStyles.bodyText}>{s.body}</div>
                      <div style={vtStyles.byline}>
                        <span>BY/ {s.author.toUpperCase()}</span>
                        <span style={{ opacity: 0.55 }}>—</span>
                        <span>{s.kicker.split('/')[1]?.trim().toUpperCase() || s.kicker}</span>
                      </div>
                    </div>

                    {/* color-coded letter card */}
                    <div style={{ ...vtStyles.col2, background: s.hue, color: contrastT(s.hue) }}>
                      <div style={vtStyles.col2Stripes(contrastT(s.hue))} />
                      <div style={vtStyles.bigSwatch}>{s.swatch}</div>
                      <div style={vtStyles.col2Foot}>
                        <div>NO. {s.no}</div>
                        <div>{s.tag.toUpperCase()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right ribbon — index runner */}
        <aside style={vtStyles.ribbon}>
          <div style={vtStyles.ribbonInner}>
            {slides.map((s, i) => (
              <div
                key={s.no}
                style={{
                  ...vtStyles.ribbonItem,
                  fontWeight: i === index ? 700 : 400,
                  background: i === index ? '#0a0a0a' : 'transparent',
                  color: i === index ? '#fafaf7' : '#0a0a0a',
                }}
                onClick={() => jumpTo(i)}
              >
                {s.no} · {s.tag}
              </div>
            ))}
          </div>
          <div style={vtStyles.ribbonLabel}>INDEX ↓</div>
        </aside>
      </div>

      {/* Footer — brick minimap (echoes the napkin sketch directly) + arrows */}
      <footer style={vtStyles.footer}>
        <BrickMap
          count={slides.length}
          index={index}
          progress={progress}
          onJump={(i) => jumpTo(i)}
        />
        <div style={vtStyles.arrowGroup}>
          <button onClick={prev} disabled={index === 0} style={vtStyles.arrowBtn} aria-label="Previous">◁</button>
          <span style={vtStyles.indexText}>
            {String(index + 1).padStart(2, '0')}
            <span style={{ opacity: 0.4 }}>/{String(slides.length).padStart(2, '0')}</span>
          </span>
          <button onClick={next} disabled={index === slides.length - 1} style={vtStyles.arrowBtn} aria-label="Next">▷</button>
        </div>
      </footer>
    </div>
  );
}

// Brick-wall minimap — directly echoes the napkin sketch's stacked rectangles.
// 4 rows × N columns; the active slide's column highlights top-down.
function BrickMap({ count, index, progress, onJump }) {
  const rows = 4;
  const offsetRow = (r) => (r % 2) * 0.5; // staggered like brickwork
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: 2, marginLeft: offsetRow(r) * 11 }}>
          {Array.from({ length: count }).map((_, i) => {
            const dist = Math.abs(progress - i);
            const active = dist < 0.5;
            const filled = active && r >= rows - Math.ceil((1 - dist) * rows);
            return (
              <button
                key={i}
                onClick={() => onJump(i)}
                aria-label={`slide ${i + 1}`}
                style={{
                  width: 20, height: 8,
                  border: '1px solid #0a0a0a',
                  background: filled ? '#0a0a0a' : (active ? 'rgba(10,10,10,0.15)' : 'transparent'),
                  padding: 0, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background .2s',
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function contrastT(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substr(0,2), 16), g = parseInt(h.substr(2,2), 16), b = parseInt(h.substr(4,2), 16);
  return (0.299*r + 0.587*g + 0.114*b)/255 > 0.55 ? '#0a0a0a' : '#fafafa';
}

const vtStyles = {
  frame: {
    width: 960, height: 600, background: '#0a0a0a',
    border: '1.5px solid #0a0a0a',
    fontFamily: '"DM Mono", "Space Mono", ui-monospace, monospace',
    fontSize: 11, color: '#fafaf7',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    userSelect: 'none',
  },
  statusBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 14px',
    background: '#0a0a0a',
    color: '#c8e870',
    fontSize: 11, letterSpacing: '0.04em',
    borderBottom: '1.5px solid #c8e870',
    flex: '0 0 auto',
  },
  body: {
    flex: '1 1 auto',
    display: 'grid', gridTemplateColumns: '1fr 64px',
    background: '#fafaf7', color: '#0a0a0a',
    overflow: 'hidden',
  },
  stage: {
    position: 'relative', overflow: 'hidden',
    borderRight: '1.5px solid #0a0a0a',
  },
  track: {
    display: 'flex', width: '100%', height: '100%',
    willChange: 'transform',
  },
  slide: { flex: '0 0 100%', height: '100%' },
  slideInner: {
    height: '100%',
    display: 'grid', gridTemplateColumns: '1.4fr 1fr',
    gap: 0,
  },
  col1: {
    padding: '24px 24px 16px',
    display: 'flex', flexDirection: 'column', gap: 12,
    overflow: 'hidden',
  },
  tickerLine: {
    fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
    color: '#0a0a0a',
    paddingBottom: 8, borderBottom: '1.5px solid #0a0a0a',
    overflow: 'hidden', whiteSpace: 'nowrap',
  },
  bigTitle: {
    fontFamily: '"Space Mono", monospace',
    fontSize: 30, fontWeight: 700, lineHeight: 1.05,
    letterSpacing: '-0.04em', textTransform: 'uppercase',
    margin: 0, textWrap: 'balance',
  },
  standfirst: {
    fontFamily: '"DM Mono", monospace',
    fontSize: 12, lineHeight: 1.45,
    color: '#2a2a2a',
  },
  bodyText: {
    fontFamily: '"DM Mono", monospace',
    fontSize: 10.5, lineHeight: 1.6,
    color: '#1a1a1a',
    flex: '1 1 auto',
    paddingTop: 6, borderTop: '1px dashed rgba(0,0,0,0.3)',
  },
  byline: {
    display: 'flex', gap: 10, alignItems: 'center',
    fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
    paddingTop: 8, borderTop: '1.5px solid #0a0a0a',
    flex: '0 0 auto',
  },
  col2: {
    position: 'relative',
    padding: 16,
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  },
  col2Stripes: (c) => ({
    position: 'absolute', inset: 0,
    backgroundImage: `repeating-linear-gradient(0deg, transparent 0 12px, ${c} 12px 13px)`,
    opacity: 0.13,
    pointerEvents: 'none',
  }),
  bigSwatch: {
    position: 'relative',
    fontFamily: '"Space Mono", monospace',
    fontSize: 220, fontWeight: 700, lineHeight: 0.85,
    letterSpacing: '-0.06em',
    alignSelf: 'flex-end',
  },
  col2Foot: {
    position: 'relative',
    display: 'flex', justifyContent: 'space-between',
    fontSize: 10, letterSpacing: '0.12em',
    paddingTop: 8, borderTop: '1.5px solid currentColor',
  },
  ribbon: {
    background: '#0a0a0a',
    color: '#fafaf7',
    padding: '12px 0 8px',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    overflow: 'hidden',
  },
  ribbonInner: {
    display: 'flex', flexDirection: 'column', gap: 4,
    transform: 'rotate(180deg)', writingMode: 'vertical-rl',
    fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
    padding: '0 4px',
  },
  ribbonItem: {
    cursor: 'pointer',
    padding: '8px 4px',
    border: '1px solid rgba(250,250,247,0.2)',
    transition: 'background .2s, color .2s',
    textAlign: 'center',
    minHeight: 80,
  },
  ribbonLabel: {
    fontSize: 9, letterSpacing: '0.18em', textAlign: 'center',
    opacity: 0.5, padding: '4px 0',
  },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 18px',
    background: '#0a0a0a',
    borderTop: '1.5px solid #c8e870',
    flex: '0 0 auto',
  },
  arrowGroup: {
    display: 'flex', alignItems: 'center', gap: 14,
    color: '#fafaf7',
    fontFamily: '"Space Mono", monospace',
  },
  arrowBtn: {
    background: 'transparent', border: '1px solid #fafaf7',
    color: '#fafaf7', fontSize: 16, lineHeight: 1,
    width: 30, height: 30, padding: 0, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  indexText: {
    fontSize: 16, letterSpacing: '0.04em', fontWeight: 700,
    minWidth: 60, textAlign: 'center',
  },
};

window.VariantTape = VariantTape;
