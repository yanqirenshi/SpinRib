// SpinRib core — shared carousel state hook + nav primitives.
// Handles: drag/swipe, keyboard arrows, mouse wheel, click prev/next,
// snap-to-item, configurable easing + speed.

const EASINGS = {
  'linear':       t => t,
  'ease-out':     t => 1 - Math.pow(1 - t, 3),
  'ease-in-out':  t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2,
  'spring':       t => {
    // simple over-shoot spring (no bounce > 1)
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  'snap':         t => t < 0.85 ? t / 0.85 : 1, // mostly linear, last 15% jumps
};

// Hook: useCarousel({ count, speed, easing, snap, onIndex })
// Returns { index, progress, bind, jumpTo, next, prev, isDragging }
//   - index: integer slide index (0..count-1)
//   - progress: float position during drag/transition (can be fractional)
//   - bind: spread onto the track wrapper for pointer + wheel events
//   - jumpTo(i, opts?): animate to index (opts.immediate skips animation)
//   - next() / prev(): step ±1
function useCarousel({ count, speed = 1, easing = 'ease-out', snap = true, loop = false, onIndex }) {
  const [index, setIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(0); // float position
  const [isDragging, setIsDragging] = React.useState(false);

  const animRef = React.useRef(null);
  const dragRef = React.useRef(null);
  const wheelLockRef = React.useRef(0);
  const containerRef = React.useRef(null);

  const easeFn = EASINGS[easing] || EASINGS['ease-out'];
  const baseDuration = 520; // ms at speed=1

  // Cancel any running animation
  const cancelAnim = () => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current.raf);
      animRef.current = null;
    }
  };

  const clamp = (i) => {
    if (loop) return ((i % count) + count) % count;
    return Math.max(0, Math.min(count - 1, i));
  };

  const jumpTo = React.useCallback((target, opts = {}) => {
    const t = clamp(target);
    cancelAnim();
    if (opts.immediate) {
      setIndex(t);
      setProgress(t);
      onIndex && onIndex(t);
      return;
    }
    const start = performance.now();
    const from = progressRef.current;
    const distance = Math.abs(t - from);
    const duration = Math.max(120, baseDuration * distance / Math.max(1, speed));
    const tick = (now) => {
      const elapsed = now - start;
      const k = Math.min(1, elapsed / duration);
      const eased = easeFn(k);
      const p = from + (t - from) * eased;
      setProgress(p);
      progressRef.current = p;
      if (k < 1) {
        animRef.current.raf = requestAnimationFrame(tick);
      } else {
        animRef.current = null;
        setIndex(t);
        setProgress(t);
        progressRef.current = t;
        onIndex && onIndex(t);
      }
    };
    animRef.current = { raf: requestAnimationFrame(tick) };
  }, [count, speed, easing, loop, onIndex]);

  // Keep a ref of progress so the rAF loop reads the latest value without re-creating
  const progressRef = React.useRef(0);
  React.useEffect(() => { progressRef.current = progress; }, [progress]);

  const next = React.useCallback(() => jumpTo(index + 1), [index, jumpTo]);
  const prev = React.useCallback(() => jumpTo(index - 1), [index, jumpTo]);

  // Pointer drag — measure in slide-widths via container size
  const onPointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    cancelAnim();
    const rect = containerRef.current?.getBoundingClientRect();
    const w = rect ? rect.width : window.innerWidth;
    dragRef.current = {
      startX: e.clientX,
      startProgress: progressRef.current,
      width: w,
      pointerId: e.pointerId,
    };
    setIsDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const slidesMoved = -dx / dragRef.current.width;
    let p = dragRef.current.startProgress + slidesMoved;
    if (!loop) p = Math.max(-0.15, Math.min(count - 1 + 0.15, p));
    setProgress(p);
    progressRef.current = p;
  };
  const onPointerUp = (e) => {
    if (!dragRef.current) return;
    const startProgress = dragRef.current.startProgress;
    const endProgress = progressRef.current;
    const delta = endProgress - startProgress;
    dragRef.current = null;
    setIsDragging(false);
    if (snap) {
      let target;
      if (Math.abs(delta) > 0.2) {
        target = delta > 0 ? Math.ceil(startProgress + 0.0001) : Math.floor(startProgress - 0.0001);
      } else {
        target = Math.round(endProgress);
      }
      jumpTo(target);
    } else {
      const target = Math.round(endProgress);
      jumpTo(target);
    }
  };

  // Mouse wheel — horizontal scroll preferred, vertical fallback. Throttled.
  const onWheel = (e) => {
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(dx) < 4) return;
    e.preventDefault();
    const now = performance.now();
    if (now - wheelLockRef.current < 380) return;
    wheelLockRef.current = now;
    if (dx > 0) next(); else prev();
  };

  const bind = {
    ref: containerRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onWheel,
    style: { touchAction: 'pan-y' },
  };

  return { index, progress, isDragging, bind, jumpTo, next, prev };
}

// Keyboard arrow nav — attach to window so it works regardless of focus.
function useArrowKeys(callbacks) {
  React.useEffect(() => {
    const onKey = (e) => {
      // Ignore if user is typing in an input
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowLeft')  { callbacks.prev && callbacks.prev(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { callbacks.next && callbacks.next(); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [callbacks.prev, callbacks.next]);
}

window.useCarousel = useCarousel;
window.useArrowKeys = useArrowKeys;
window.EASINGS = EASINGS;
