# SpinRib · React example

A React wrapper around the SpinRib library and a demo using it. The wrapper itself is shipped as part of the package at `spinrib/react`; everything in this directory is consumer-side reference code that you can copy into a Next.js (or CRA / Vite / etc.) project.

## What's here

| File                  | Role                                                                |
|-----------------------|---------------------------------------------------------------------|
| `index.html`          | In-browser bootstrap (CDN React + babel-standalone). For visual check; not for production.|
| `App.jsx`             | Demo app. Owns the controls (theme, mini-map size, chrome, transition). |
| `EditorialSlide.jsx`  | Slide component for the editorial schema (`{ kicker, spine, hueLight, hueDark, cover, items }`). |
| `sample-data.js`      | Sample data (editorial schema).                                      |
| `slide-styles.css`    | Slide-content styles.                                                |
| `styles.css`          | Page-level styles for the demo (controls, layout).                  |

The wrapper itself lives at [`../../src/react/SpinRib.jsx`](../../src/react/SpinRib.jsx) and is exported from the package as `spinrib/react`.

## Use in Next.js

### 1. Install

```bash
npm install spinrib react react-dom
```

### 2. Use the wrapper

The wrapper has `'use client'` at the top — it uses `window`, `document`, and `MutationObserver` and must run client-side. Components that render `<SpinRib>` must therefore also be client components.

```jsx
// app/demo/page.tsx (or wherever)
'use client';

import { SpinRib } from 'spinrib/react';
import 'spinrib/styles';   // optional helper to inject library CSS;
                           // alternatively the library auto-injects on first
                           // instance via the imperative entry point.

const spines = [
  { cover: 'Hello' },
  { cover: 'World', items: { right: ['World again', 'World once more'] } },
  { cover: 'Bye',   items: { left:  ['Bye-bye'] } },
];

export default function Demo() {
  return (
    <SpinRib
      spines={spines}
      renderSlide={(data, ctx) => (
        <div style={{
          display: 'grid', placeItems: 'center',
          background: 'var(--spr-bg)', color: 'var(--spr-fg)',
          fontSize: 100,
        }}>
          {data}
        </div>
      )}
      style={{ width: 1280, aspectRatio: '16 / 9' }}
    />
  );
}
```

### 3. Theme switching

The library exposes CSS variables on `.spr-root`: `--spr-bg`, `--spr-fg`, `--spr-fg-subtle`, `--spr-fg-faint`, `--spr-border`, `--spr-panel`, `--spr-panel-solid`, `--spr-accent`. Reading these from your slide markup makes light/dark switching automatic when you call `setTheme()` (or pass a new `theme` prop).

### 4. Reading row-level data inside `renderSlide`

`renderSlide` receives `(data, ctx)` where `ctx = { y, x, isCover, theme }`. To read row-level fields (your own schema additions), close over the spines array — the factory pattern in `EditorialSlide.jsx` shows this.

```jsx
function makeRenderer(spines) {
  return function renderSlide(data, ctx) {
    const row = spines[ctx.y];
    return <MySlide data={data} row={row} ctx={ctx} />;
  };
}

const renderSlide = useMemo(() => makeRenderer(spines), [spines]);

<SpinRib spines={spines} renderSlide={renderSlide} ... />
```

### 5. Stable callback identity

`renderSlide`, `rowLabel`, and `onChange` are read through a ref inside the wrapper, so changing them between renders does **not** rebuild the underlying SpinRib instance. You can pass inline arrow functions safely, but for performance prefer `useMemo` / `useCallback`.

The wrapper rebuilds the SpinRib instance only when the `spines` prop reference changes (a structural change). Keep `spines` stable (state, ref, or memoized) to avoid unnecessary teardown.

## Wrapper internals (FYI)

- The wrapper renders a `<div>` and mounts a SpinRib instance into it on first render.
- For each slide, the library asks the wrapper for an `HTMLElement`. The wrapper creates a div, mounts a React subtree into it via `createRoot`, and returns the div.
- A `MutationObserver` watches the container for removed slide divs and unmounts the corresponding React roots, so `useEffect` cleanups in slide components run as expected.
- Prop changes for `theme` / `miniSize` / `chrome` / `transition` are forwarded to the instance via its setters (no rebuild).
- On unmount the wrapper destroys the SpinRib instance and unmounts all per-slide React roots.

## Running this directory in development

The included `index.html` boots the JSX via babel-standalone for a quick in-browser preview. From the project root:

```bash
npm run serve
# then open http://localhost:8000/examples/react/index.html
```

For real React projects (Vite / CRA / Next.js) the canonical sources are the `.jsx` files; copy them into your project structure and import `SpinRib` from `'spinrib/react'` instead of the relative path used in the demo. See [`../nextjs/`](../nextjs/) for a Next.js-specific layout.
