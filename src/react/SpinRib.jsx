'use client';

// React wrapper around the SpinRib library. The library itself is
// framework-agnostic and renders DOM imperatively; this wrapper bridges
// that to React.
//
// Required peer dependencies: react@>=18, react-dom@>=18.
//
// Usage:
//   import { SpinRib } from 'spinrib/react';
//
//   <SpinRib
//     spines={spines}
//     renderSlide={(data, ctx) => <MySlide data={data} ctx={ctx} />}
//     theme="light"
//     style={{ width: 1280, aspectRatio: '16 / 9' }}
//   />

import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { SpinRib as SpinRibLib } from '../spinrib.js';

/**
 * @param {object} props
 * @param {Array} props.spines
 * @param {(data: any, ctx: { y:number, x:number, isCover:boolean, theme:'light'|'dark' }) => React.ReactNode} props.renderSlide
 * @param {(row:any, y:number) => string} [props.rowLabel]
 * @param {'light'|'dark'} [props.theme='light']
 * @param {'sm'|'md'|'lg'} [props.miniSize='md']
 * @param {'arrows'|'arrows-with-hints'|'keyboard'|'both'} [props.chrome='arrows']
 * @param {'slide'|'fade'|'cut'} [props.transition='slide']
 * @param {boolean} [props.enableKeys=true]
 * @param {(event:{type:string, pos:{y:number,x:number}, data:any}) => void} [props.onChange]
 * @param {string} [props.className]
 * @param {React.CSSProperties} [props.style]
 */
export function SpinRib({
  spines,
  renderSlide,
  rowLabel,
  theme = 'light',
  miniSize = 'md',
  chrome = 'arrows',
  transition = 'slide',
  enableKeys = true,
  onChange,
  className,
  style,
}) {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  // Latest callbacks held in a ref so the SpinRib instance (created once
  // per spines) always sees the freshest closures without rebuilding.
  const cbRef = useRef({});
  cbRef.current.renderSlide = renderSlide;
  cbRef.current.rowLabel = rowLabel;
  cbRef.current.onChange = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    // Track React roots we've mounted into per-slide containers so we
    // can unmount them when SpinRib removes a slide div from the DOM.
    const roots = new Map();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const removed of m.removedNodes) {
          const stack = [removed];
          while (stack.length) {
            const n = stack.pop();
            if (roots.has(n)) {
              const r = roots.get(n);
              roots.delete(n);
              // Defer the unmount: React forbids unmount during a commit
              // phase, and we may still be inside one when this callback fires.
              queueMicrotask(() => { try { r.unmount(); } catch (_) {} });
            }
            if (n.childNodes) {
              for (const c of n.childNodes) stack.push(c);
            }
          }
        }
      }
    });
    observer.observe(containerRef.current, { childList: true, subtree: true });

    instanceRef.current = new SpinRibLib({
      container: containerRef.current,
      spines,
      renderSlide: (data, ctx) => {
        const div = document.createElement('div');
        // Fill the .spr-slide wrapper, and make our single React child
        // stretch to fill us via a 1x1 grid (default place-items: stretch).
        // This way the consumer's slide root doesn't need to set width/height.
        div.style.cssText =
          'width:100%;height:100%;display:grid;grid-template:1fr/1fr;';
        const root = createRoot(div);
        root.render(cbRef.current.renderSlide(data, ctx));
        roots.set(div, root);
        return div;
      },
      rowLabel: (row, y) =>
        cbRef.current.rowLabel
          ? String(cbRef.current.rowLabel(row, y) ?? '')
          : `Row ${y + 1}`,
      theme,
      miniSize,
      chrome,
      transition,
      enableKeys,
      onChange: (e) => cbRef.current.onChange?.(e),
    });

    return () => {
      observer.disconnect();
      instanceRef.current?.destroy();
      instanceRef.current = null;
      for (const [, r] of roots) {
        try { r.unmount(); } catch (_) {}
      }
      roots.clear();
    };
    // Callbacks come from cbRef; rebuild only when the spine structure changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spines]);

  // Cheap prop updates that don't require a rebuild.
  useEffect(() => { instanceRef.current?.setTheme(theme); }, [theme]);
  useEffect(() => { instanceRef.current?.setMiniSize(miniSize); }, [miniSize]);
  useEffect(() => { instanceRef.current?.setChrome(chrome); }, [chrome]);
  useEffect(() => { instanceRef.current?.setTransition(transition); }, [transition]);

  return <div ref={containerRef} className={className} style={style} />;
}
