// Variant A — GRID
// Brutalist editorial, baseline-grid, mono metadata + serif title.
// Full-bleed swatch on left, hard ruled lines, a position rib at the bottom.

function VariantGrid({ tweaks }) {
  const slides = window.SLIDES;
  const { index, progress, isDragging, bind, jumpTo, next, prev } =
    window.useCarousel({
      count: slides.length,
      speed: tweaks.speed,
      easing: tweaks.easing,
      snap: tweaks.snap,
    });
  window.useArrowKeys({ next, prev });

  const W = 960, H = 600;

  return (
    <div style={vgStyles.frame}>
      {/* top rule + masthead */}
      <div style={vgStyles.masthead}>
        <span style={{ fontWeight: 700 }}>SPINRIB / 014</span>
        <span style={{ opacity: 0.55 }}>EDITORIAL CAROUSEL · GRID VARIANT</span>
        <span>{String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
      </div>

      {/* viewport */}
      <div
        {...bind}
        style={{ ...vgStyles.viewport, cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          style={{
            ...vgStyles.track,
            transform: `translate3d(${-progress * 100}%, 0, 0)`,
            transition: isDragging ? 'none' : undefined,
          }}
        >
          {slides.map((s, i) => (
            <article key={s.no} style={vgStyles.slide}>
              {/* left: full-bleed swatch w/ stripes */}
              <div style={{ ...vgStyles.swatch, background: s.hue, color: contrast(s.hue) }}>
                <div style={vgStyles.swatchStripes(contrast(s.hue))} />
                <div style={vgStyles.swatchNo}>{s.no}</div>
                <div style={vgStyles.swatchTag}>[ {s.tag} ]</div>
                <div style={vgStyles.swatchPlaceholder}>
                  <span>image · {s.swatch}</span>
                </div>
              </div>

              {/* right: text column */}
              <div style={vgStyles.textCol}>
                <div style={vgStyles.kicker}>{s.kicker}</div>
                <h1 style={vgStyles.title}>{s.title}</h1>
                <p style={vgStyles.standfirst}>{s.standfirst}</p>
                <p style={vgStyles.body}>{s.body}</p>
                <div style={vgStyles.footer}>
                  <span>BY {s.author.toUpperCase()}</span>
                  <span>PP. {s.pages}</span>
                  <span>{s.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* arrows — outside the swipe area visually but inside viewport for layout */}
        <button onClick={prev} disabled={index === 0} style={{ ...vgStyles.arrow, left: 0 }} aria-label="Previous">
          <ArrowL />
        </button>
        <button onClick={next} disabled={index === slides.length - 1} style={{ ...vgStyles.arrow, right: 0 }} aria-label="Next">
          <ArrowR />
        </button>
      </div>

      {/* bottom: minimap + meta rib */}
      <div style={vgStyles.rib}>
        <div style={vgStyles.ribLeft}>
          <span style={{ fontWeight: 700 }}>POS</span>
          <Minimap
            count={slides.length}
            index={index}
            progress={progress}
            onJump={(i) => jumpTo(i)}
          />
        </div>
        <div style={vgStyles.ribRight}>
          <span style={{ opacity: 0.55 }}>← →</span>
          <span style={{ opacity: 0.55 }}>· DRAG</span>
          <span style={{ opacity: 0.55 }}>· WHEEL</span>
        </div>
      </div>
    </div>
  );
}

function Minimap({ count, index, progress, onJump }) {
  // Horizontal block ladder. Each cell is a tiny rectangle. Active block fills.
  const cells = [];
  for (let i = 0; i < count; i++) {
    const isActive = i === index;
    const fill = Math.max(0, 1 - Math.abs(progress - i)); // halo
    cells.push(
      <button
        key={i}
        onClick={() => onJump(i)}
        aria-label={`slide ${i + 1}`}
        style={{
          width: 22, height: 12, padding: 0,
          border: '1px solid #0a0a0a',
          background: isActive ? '#0a0a0a' : `rgba(10,10,10,${fill * 0.18})`,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      />
    );
  }
  return <div style={{ display: 'flex', gap: 2 }}>{cells}</div>;
}

function ArrowL() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="16,4 6,12 16,20" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>; }
function ArrowR() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="8,4 18,12 8,20" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>; }

function contrast(hex) {
  // basic luminance contrast — return black on light, white on dark
  const h = hex.replace('#', '');
  const r = parseInt(h.substr(0,2), 16), g = parseInt(h.substr(2,2), 16), b = parseInt(h.substr(4,2), 16);
  const l = (0.299*r + 0.587*g + 0.114*b) / 255;
  return l > 0.6 ? '#0a0a0a' : '#fafafa';
}

const vgStyles = {
  frame: {
    width: 960, height: 600, background: '#fafaf7',
    border: '1.5px solid #0a0a0a',
    fontFamily: '"Space Mono", ui-monospace, monospace',
    fontSize: 11, color: '#0a0a0a',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    userSelect: 'none',
  },
  masthead: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 16px',
    borderBottom: '1.5px solid #0a0a0a',
    fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
    flex: '0 0 auto',
  },
  viewport: {
    position: 'relative',
    flex: '1 1 auto',
    overflow: 'hidden',
    borderBottom: '1.5px solid #0a0a0a',
  },
  track: {
    display: 'flex',
    width: '100%', height: '100%',
    transition: 'transform .42s cubic-bezier(.2,.8,.2,1)',
    willChange: 'transform',
  },
  slide: {
    flex: '0 0 100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 1.15fr',
  },
  swatch: {
    position: 'relative',
    borderRight: '1.5px solid #0a0a0a',
    overflow: 'hidden',
    padding: 16,
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  },
  swatchStripes: (c) => ({
    position: 'absolute', inset: 0,
    backgroundImage: `repeating-linear-gradient(135deg, transparent 0 18px, ${c} 18px 19px)`,
    opacity: 0.13,
    pointerEvents: 'none',
  }),
  swatchNo: {
    position: 'relative',
    fontFamily: '"Fraunces", serif',
    fontSize: 96, fontWeight: 900,
    letterSpacing: '-0.04em', lineHeight: 1,
  },
  swatchTag: {
    position: 'relative',
    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
    alignSelf: 'flex-end',
  },
  swatchPlaceholder: {
    position: 'absolute', bottom: 16, left: 16,
    fontSize: 10, opacity: 0.65, letterSpacing: '0.1em', textTransform: 'uppercase',
    border: '1px dashed currentColor', padding: '3px 6px',
  },
  textCol: {
    padding: '24px 28px 20px',
    display: 'flex', flexDirection: 'column', gap: 12,
    overflow: 'hidden',
  },
  kicker: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
    paddingBottom: 8, borderBottom: '1px solid #0a0a0a',
  },
  title: {
    fontFamily: '"Fraunces", serif', fontVariationSettings: '"SOFT" 50',
    fontWeight: 900, fontSize: 38, lineHeight: 1.02, letterSpacing: '-0.02em',
    margin: '4px 0 0', textWrap: 'balance',
  },
  standfirst: {
    fontFamily: '"Fraunces", serif', fontStyle: 'italic',
    fontSize: 16, lineHeight: 1.35, margin: '4px 0 0',
    color: '#2a2a2a',
  },
  body: {
    fontFamily: '"Space Mono", monospace',
    fontSize: 11, lineHeight: 1.55, margin: '8px 0 0',
    color: '#1a1a1a',
    flex: '1 1 auto',
  },
  footer: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
    paddingTop: 10, borderTop: '1px solid #0a0a0a',
    flex: '0 0 auto',
  },
  arrow: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 44, height: 44, padding: 0,
    background: '#fafaf7',
    border: '1.5px solid #0a0a0a',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#0a0a0a',
    margin: 12,
  },
  rib: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 16px', flex: '0 0 auto',
    fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
  },
  ribLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  ribRight: { display: 'flex', gap: 6 },
};

window.VariantGrid = VariantGrid;
