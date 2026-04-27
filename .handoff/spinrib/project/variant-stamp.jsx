// Variant B — STAMP
// Zine-collage feeling. Numbers bleeding off-canvas, rotated stamps,
// scotch-taped overlays, mono captions, mixed-case typography.
// Minimap is a vertical "ladder" of stacked blocks (echoes the sketch).

function VariantStamp({ tweaks }) {
  const slides = window.SLIDES;
  const { index, progress, isDragging, bind, jumpTo, next, prev } =
    window.useCarousel({
      count: slides.length,
      speed: tweaks.speed,
      easing: tweaks.easing,
      snap: tweaks.snap,
    });

  return (
    <div style={vsStyles.frame}>
      {/* Off-canvas big number — bleeds left */}
      <div style={vsStyles.bigNumWrap}>
        <div style={vsStyles.bigNum}>{slides[index].no}</div>
      </div>

      {/* Header strip */}
      <header style={vsStyles.header}>
        <div style={vsStyles.headLeft}>
          <span style={vsStyles.brand}>SpinRib</span>
          <span style={vsStyles.brandSub}>// stamp · variant B</span>
        </div>
        <div style={vsStyles.headRight}>
          <span style={vsStyles.dot} />
          REC · {slides[index].kicker.toLowerCase()}
        </div>
      </header>

      {/* Stage */}
      <div
        {...bind}
        style={{ ...vsStyles.stage, cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          style={{
            ...vsStyles.track,
            transform: `translate3d(${-progress * 100}%, 0, 0)`,
            transition: isDragging ? 'none' : undefined,
          }}
        >
          {slides.map((s, i) => (
            <div key={s.no} style={vsStyles.slide}>
              {/* Photo card with tape */}
              <div style={{ ...vsStyles.card, transform: `rotate(${i % 2 === 0 ? '-1.2deg' : '0.8deg'})` }}>
                <div style={{ ...vsStyles.tape, top: -10, left: 30, transform: 'rotate(-4deg)' }} />
                <div style={{ ...vsStyles.tape, top: -10, right: 36, transform: 'rotate(3deg)' }} />
                <div style={{ ...vsStyles.photo, background: s.hue, color: contrastB(s.hue) }}>
                  <div style={vsStyles.photoStripes(contrastB(s.hue))} />
                  <div style={vsStyles.photoCorner}>{s.swatch}</div>
                  <div style={vsStyles.photoCaption}>
                    <span>fig. {s.no}</span>
                    <span>—</span>
                    <span>{s.tag}</span>
                  </div>
                  <div style={vsStyles.photoStamp}>★ {s.kicker.split('/')[1]?.trim() || s.kicker}</div>
                </div>
                <div style={vsStyles.cardCaption}>
                  <span>{s.author}</span>
                  <span>·</span>
                  <span>pp. {s.pages}</span>
                </div>
              </div>

              {/* Text block — type-on-type collage */}
              <div style={vsStyles.text}>
                <div style={vsStyles.kicker}>
                  <span style={vsStyles.kickerBox}>▒▒</span>
                  <span>{s.kicker}</span>
                </div>
                <h1 style={vsStyles.title}>
                  {s.title.split(' ').map((w, k) => (
                    <span
                      key={k}
                      style={{
                        display: 'inline-block',
                        marginRight: '0.18em',
                        transform: k % 5 === 2 ? 'translateY(2px)' : k % 7 === 4 ? 'translateY(-2px)' : 'none',
                      }}
                    >{w}</span>
                  ))}
                </h1>
                <p style={vsStyles.standfirst}>“{s.standfirst}”</p>
                <p style={vsStyles.body}>{s.body}</p>
                <div style={vsStyles.stamp}>
                  <div style={vsStyles.stampInner}>
                    APPROVED<br/>
                    <span style={{ fontSize: 8 }}>SPR · {s.date} · {s.no}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Triangle arrows — left & right edges */}
        <button onClick={prev} disabled={index === 0} style={{ ...vsStyles.tri, left: 8 }} aria-label="Previous">
          <svg width="34" height="44" viewBox="0 0 34 44"><polygon points="32,2 4,22 32,42" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
        <button onClick={next} disabled={index === slides.length - 1} style={{ ...vsStyles.tri, right: 8 }} aria-label="Next">
          <svg width="34" height="44" viewBox="0 0 34 44"><polygon points="2,2 30,22 2,42" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
      </div>

      {/* Bottom: ladder minimap (echoes the sketch's stacked blocks) */}
      <footer style={vsStyles.footer}>
        <LadderMap
          count={slides.length}
          index={index}
          progress={progress}
          onJump={(i) => jumpTo(i)}
          slides={slides}
        />
        <div style={vsStyles.helpBlock}>
          <div>↓ DRAG TO TURN PAGE</div>
          <div>↓ ←/→ TO STEP</div>
        </div>
      </footer>
    </div>
  );
}

function LadderMap({ count, index, progress, onJump, slides }) {
  // Stacked rectangle ladder — shape echoes the user's sketch
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
        {Array.from({ length: count }).map((_, i) => {
          const dist = Math.abs(progress - i);
          const h = Math.max(8, 28 - dist * 7);
          const isActive = i === index;
          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              aria-label={`slide ${i + 1}`}
              style={{
                width: 18, height: h,
                border: '1.5px solid #0a0a0a',
                background: isActive ? slides[i].hue : '#fafaf7',
                padding: 0, cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'height .25s, background .25s',
              }}
            />
          );
        })}
      </div>
      <div style={{ fontSize: 10, lineHeight: 1.3 }}>
        <div style={{ fontWeight: 700 }}>POS · {String(index + 1).padStart(2,'0')}/{String(count).padStart(2,'0')}</div>
        <div style={{ opacity: 0.6 }}>{slides[index].title.slice(0, 32)}{slides[index].title.length > 32 ? '…' : ''}</div>
      </div>
    </div>
  );
}

function contrastB(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substr(0,2), 16), g = parseInt(h.substr(2,2), 16), b = parseInt(h.substr(4,2), 16);
  const l = (0.299*r + 0.587*g + 0.114*b) / 255;
  return l > 0.55 ? '#0a0a0a' : '#fafafa';
}

const vsStyles = {
  frame: {
    position: 'relative',
    width: 960, height: 600, background: '#f2efe6',
    border: '1.5px solid #0a0a0a',
    fontFamily: '"Space Mono", ui-monospace, monospace',
    fontSize: 11, color: '#0a0a0a',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    userSelect: 'none',
  },
  bigNumWrap: {
    position: 'absolute', left: -36, top: 56, zIndex: 0,
    pointerEvents: 'none',
  },
  bigNum: {
    fontFamily: '"Fraunces", serif',
    fontSize: 360, fontWeight: 900, lineHeight: 0.85,
    color: 'rgba(10,10,10,0.045)',
    letterSpacing: '-0.06em',
  },
  header: {
    position: 'relative', zIndex: 2,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 16px',
    borderBottom: '1.5px solid #0a0a0a',
    background: '#f2efe6',
  },
  headLeft: { display: 'flex', alignItems: 'baseline', gap: 8 },
  brand: { fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' },
  brandSub: { fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em' },
  headRight: { fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 },
  dot: { display: 'inline-block', width: 8, height: 8, background: '#ff4d2e', borderRadius: '50%', animation: 'spr-blink 1.4s infinite' },
  stage: {
    position: 'relative', zIndex: 1,
    flex: '1 1 auto', overflow: 'hidden',
  },
  track: {
    display: 'flex', width: '100%', height: '100%',
    willChange: 'transform',
  },
  slide: {
    flex: '0 0 100%', height: '100%',
    display: 'grid', gridTemplateColumns: '1.05fr 1fr',
    gap: 16, padding: '20px 28px 16px 24px',
    alignItems: 'stretch',
  },
  card: {
    position: 'relative',
    background: '#fff',
    padding: 10,
    border: '1.5px solid #0a0a0a',
    boxShadow: '6px 6px 0 0 #0a0a0a',
    display: 'flex', flexDirection: 'column',
    transition: 'transform .35s',
  },
  tape: {
    position: 'absolute', width: 60, height: 22,
    background: 'rgba(254, 242, 0, 0.7)',
    border: '1px solid rgba(0,0,0,0.15)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
  },
  photo: {
    position: 'relative', flex: '1 1 auto',
    minHeight: 280,
    overflow: 'hidden',
    border: '1.5px solid #0a0a0a',
  },
  photoStripes: (c) => ({
    position: 'absolute', inset: 0,
    backgroundImage: `repeating-linear-gradient(45deg, transparent 0 14px, ${c} 14px 15px)`,
    opacity: 0.18, pointerEvents: 'none',
  }),
  photoCorner: {
    position: 'absolute', top: 8, right: 8,
    fontFamily: '"Fraunces", serif', fontSize: 48, fontWeight: 900,
    lineHeight: 1, letterSpacing: '-0.04em',
  },
  photoCaption: {
    position: 'absolute', bottom: 8, left: 8,
    fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
    display: 'flex', gap: 6,
    background: 'rgba(0,0,0,0.06)', padding: '3px 6px',
  },
  photoStamp: {
    position: 'absolute', bottom: 16, right: 12,
    border: '1.5px solid currentColor', padding: '4px 8px',
    fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
    transform: 'rotate(-6deg)',
    fontWeight: 700,
  },
  cardCaption: {
    display: 'flex', gap: 6,
    paddingTop: 8,
    fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
  },
  text: {
    position: 'relative',
    padding: '4px 6px 0',
    display: 'flex', flexDirection: 'column', gap: 10,
    overflow: 'hidden',
  },
  kicker: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
  },
  kickerBox: { fontFamily: '"Space Mono", monospace', color: '#ff4d2e', letterSpacing: 0 },
  title: {
    fontFamily: '"Fraunces", serif', fontVariationSettings: '"SOFT" 100',
    fontWeight: 900, fontSize: 36, lineHeight: 1.02, letterSpacing: '-0.025em',
    margin: 0, textWrap: 'balance',
  },
  standfirst: {
    fontFamily: '"Fraunces", serif', fontStyle: 'italic',
    fontSize: 14, lineHeight: 1.35, margin: 0,
    color: '#2a2a2a',
  },
  body: {
    fontFamily: '"Space Mono", monospace',
    fontSize: 10.5, lineHeight: 1.6, margin: 0,
    color: '#1a1a1a',
    columnCount: 2, columnGap: 16,
    flex: '1 1 auto',
  },
  stamp: {
    alignSelf: 'flex-end',
    border: '2px solid #ff4d2e', color: '#ff4d2e',
    padding: '6px 14px',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
    transform: 'rotate(-4deg)',
    fontFamily: '"Space Mono", monospace',
    background: 'rgba(255,77,46,0.04)',
  },
  stampInner: { textAlign: 'center', lineHeight: 1.2 },
  tri: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 50, height: 60,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#0a0a0a',
    padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    padding: '12px 20px 14px',
    borderTop: '1.5px solid #0a0a0a',
    background: '#f2efe6',
    flex: '0 0 auto',
    position: 'relative', zIndex: 2,
  },
  helpBlock: {
    fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
    textAlign: 'right', lineHeight: 1.5,
  },
};

// inject blink keyframes once
if (typeof document !== 'undefined' && !document.getElementById('spr-anim')) {
  const s = document.createElement('style');
  s.id = 'spr-anim';
  s.textContent = '@keyframes spr-blink{0%,49%{opacity:1}50%,100%{opacity:0.2}}';
  document.head.appendChild(s);
}

window.VariantStamp = VariantStamp;
