# SpinRib

A 2D spine-and-rib slider for the web. Vertical spine of rows; each row has uneven-length ribs extending left and right. ↑↓ jumps between spine rows, ←→ traverses ribs of the current row.

Zero dependencies. Vanilla ES modules. No build step required. Content-agnostic — bring your own slide renderer.

## Quick start

```html
<div id="slider" style="width: 1280px; aspect-ratio: 16/9"></div>

<script type="module">
  import { SpinRib } from './src/spinrib.js';

  // Layer 1 — structure (the only thing the library cares about)
  const spines = [
    { cover: 'A',
      items: { right: ['A1', 'A2'] } },
    { cover: 'B',
      items: { left: ['B-left'], right: ['B1'] } },
    { cover: 'C' },
  ];

  // Layer 2 — content (your responsibility)
  function renderSlide(data, ctx) {
    const div = document.createElement('div');
    div.textContent = data;
    div.style.cssText = `
      display: grid; place-items: center;
      background: var(--spr-bg); color: var(--spr-fg);
      font-size: 120px;
    `;
    return div;
  }

  new SpinRib({
    container: document.getElementById('slider'),
    spines,
    renderSlide,
  });
</script>
```

For a fully styled editorial example with all controls wired up, see [`examples/vanilla/index.html`](examples/vanilla/index.html).

### React / Next.js

```bash
npm install spinrib react react-dom
```

```jsx
'use client';
import { SpinRib } from 'spinrib/react';

export default function Demo() {
  return (
    <SpinRib
      spines={[
        { cover: 'Hello' },
        { cover: 'World', items: { right: ['World again'] } },
      ]}
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

`'use client'` is required when rendering `<SpinRib>` from a Next.js server component — the library uses `window` / `document`. The [`examples/nextjs/`](examples/nextjs/) directory shows a full App Router project layout with the Server / Client boundary in place; [`examples/react/README.md`](examples/react/README.md) covers the wrapper's internals.

## Data model — two layers

SpinRib's data model has a sharp split:

- **Layer 1 — structure** (`cover`, `items.left[]`, `items.right[]`). The library inspects this to compute coordinates and bounds. **This is the only part of the library's contract.**
- **Layer 2 — content** (whatever you put inside `cover` and the items arrays). Opaque to the library, interpreted only by your `renderSlide` callback.

Minimum row:

```js
{
  cover: any,                        // REQUIRED. Lives at (y, 0).
  items?: {
    left?:  any[],                   // outward: [0]→x=-1, [1]→x=-2, ...
    right?: any[],                   // outward: [0]→x=+1, [1]→x=+2, ...
  },
}
```

Rib counts are derived from array lengths — there is no `leftCount` / `rightCount` to keep in sync.

For the full specification — coordinate rules, validation, CSS variable contract, JSON Schema — see [`DATAMODEL.md`](DATAMODEL.md).

## Options

| Option        | Type                                                       | Default     | Description                                              |
|---------------|------------------------------------------------------------|-------------|----------------------------------------------------------|
| `container`   | `HTMLElement`                                              | required    | Element to mount into                                    |
| `spines`      | `SpineRow[]`                                               | required    | Spine rows (Layer 1)                                     |
| `renderSlide` | `(data, ctx) => HTMLElement`                               | required    | Convert your data into slide DOM                         |
| `theme`       | `'light' \| 'dark'`                                        | `'light'`   |                                                          |
| `miniSize`    | `'sm' \| 'md' \| 'lg'`                                     | `'md'`      | Mini-map density                                         |
| `chrome`      | `'arrows' \| 'arrows-with-hints' \| 'keyboard' \| 'both'`  | `'arrows'`  | Navigation affordance style                              |
| `transition`  | `'slide' \| 'fade' \| 'cut'`                               | `'slide'`   | Slide-change animation                                   |
| `enableKeys`  | `boolean`                                                  | `true`      | Bind arrow keys on `window`                              |
| `rowLabel`    | `(row, y) => string`                                       | `Row ${y+1}`| Label shown in mini-map's current-row indicator          |
| `onChange`    | `(event) => void`                                          | —           | `event = { type, pos: {y,x}, data }`                     |

### `renderSlide` context

```ts
ctx = {
  y: number,            // row index
  x: number,            // signed offset from spine (0 = cover)
  isCover: boolean,     // x === 0
  theme: 'light' | 'dark',
}
```

To read row-level fields (your own schema additions like a category label, hue, etc.), close over the `spines` array:

```js
function makeRenderer(spines) {
  return function renderSlide(data, ctx) {
    const row = spines[ctx.y];
    // ... use row.myCategory etc.
  };
}
```

The reference editorial demo at [`examples/vanilla/slide-renderer.js`](examples/vanilla/slide-renderer.js) uses this pattern.

## API

```js
const slider = new SpinRib({ /* ... */ });

slider.moveBy(dx, dy);      // dy moves to next/prev row's cover; dx moves along current rib
slider.jumpTo(y, x);        // jump to (y, x); silently ignored if out of range
slider.setTheme('dark');
slider.setMiniSize('lg');
slider.setChrome('keyboard');
slider.setTransition('fade');
slider.currentData();       // raw data at the current position
slider.currentPos();        // { y, x, isCover }
slider.destroy();           // unmounts, removes key listener
```

## Navigation rules

- **↑ / ↓** — moves along the spine. Always lands on the cover (`x = 0`) of the target row. Disabled at the top/bottom rows.
- **← / →** — moves along the current row's ribs. Disabled when `x` reaches the rib's outer end.
- **Mini-map cell click** — jumps directly to that slide.

## CSS variables

The library exposes these on `.spr-root` so your `renderSlide` markup can participate in theme switching:

`--spr-bg`, `--spr-fg`, `--spr-fg-subtle`, `--spr-fg-faint`, `--spr-border`, `--spr-panel`, `--spr-panel-solid`, `--spr-accent`.

See [`DATAMODEL.md` § 4](DATAMODEL.md#4-css-variable-contract-public) for the full contract.

## Files

```
src/
  spinrib.js              — main class, no dependencies (Layer 1 only)
  theme.js                — color tokens for light/dark
  styles.js               — chrome CSS injected into <head> on first instance
  react/SpinRib.jsx       — React wrapper, exported as 'spinrib/react'

examples/
  vanilla/                — framework-agnostic demo (no build step required)
    index.html
    sample-data.js
    slide-renderer.js
    slide-styles.css
  react/                  — React demo (CDN React + babel-standalone)
    index.html
    App.jsx
    EditorialSlide.jsx
    sample-data.js
    slide-styles.css
    styles.css
    README.md
  nextjs/                 — Next.js (App Router) project starter
    package.json
    next.config.mjs
    app/{layout,page}.jsx
    components/Demo.jsx
    components/EditorialSlide.jsx
    components/sample-data.js
    components/slide-styles.css
    README.md

DATAMODEL.md              — full data-model specification
tools/dev-server.py       — `npm run serve` (no-cache static server for dev)
```

## License

MIT
