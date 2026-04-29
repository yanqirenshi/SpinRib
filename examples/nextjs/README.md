# SpinRib · Next.js example

A minimal Next.js (App Router) project that uses SpinRib via the `spinrib/react` wrapper. Demonstrates:

- Server Component (`app/page.jsx`) → Client Component (`components/Demo.jsx`) boundary
- Where the `'use client'` directive goes and why
- `transpilePackages: ['spinrib']` in `next.config.mjs` (the library ships .jsx, Next.js needs to transpile)

## Layout

```
examples/nextjs/
├── package.json
├── next.config.mjs
├── app/
│   ├── layout.jsx        — root layout
│   ├── page.jsx          — Server Component, renders <Demo />
│   └── globals.css       — page-level styles
└── components/
    ├── Demo.jsx          — 'use client'; renders <SpinRib /> with state
    ├── EditorialSlide.jsx — slide renderer for the editorial schema
    ├── sample-data.js    — sample data
    └── slide-styles.css  — slide-content styles
```

## Run locally

This example assumes `spinrib` is available as a dependency. There are two ways to wire that up:

### Option A — once spinrib is published to npm

```bash
cd examples/nextjs
npm install
npm run dev
```

### Option B — develop against the in-repo source (linked)

From the **repo root**:

```bash
# 1. Make this repo's package available as a tarball link
npm link
# 2. Wire it into the Next.js example
cd examples/nextjs
npm install        # installs next, react, react-dom from the registry
npm link spinrib   # symlinks node_modules/spinrib → repo root
npm run dev
```

Open http://localhost:3000 .

> **Note** — `npm link spinrib` makes Next.js resolve `import { SpinRib } from 'spinrib/react'` to `<repo-root>/src/react/SpinRib.jsx`. The `transpilePackages: ['spinrib']` line in `next.config.mjs` is what allows Next.js to transform the `.jsx` source on the fly.

## Server / Client boundary

`app/page.jsx` is a Server Component (the default in App Router). It does **not** import `<SpinRib>` directly because:

1. `<SpinRib>` uses `window`, `document`, and `MutationObserver` — those don't exist on the server.
2. The `renderSlide` and `rowLabel` props are functions, which are **not serializable** across the Server → Client boundary.

So instead, `page.jsx` imports `<Demo>`, which has `'use client'` at the top of `components/Demo.jsx`. Everything from `<Demo>` downward runs on the client.

```
app/page.jsx          ← Server Component (no 'use client')
  └─ <Demo />         ← components/Demo.jsx has 'use client' on line 1
       └─ <SpinRib /> ← from spinrib/react, also has 'use client'
            └─ renderSlide(...) → <EditorialSlide />
```

## Key code references

| Concern                              | File                                    |
|--------------------------------------|-----------------------------------------|
| Server entry point                   | `app/page.jsx`                          |
| Client boundary + slider state       | `components/Demo.jsx`                   |
| renderSlide callback (factory)       | `components/EditorialSlide.jsx`         |
| Layered data model — your schema     | `components/sample-data.js`             |
| Transpile config for spinrib package | `next.config.mjs`                       |

## Theme switching

Theme tokens are exposed as CSS variables on `.spr-root` (`--spr-bg`, `--spr-fg`, etc.). Slide markup that uses `var(--spr-bg)` etc. follows the theme automatically when you call `setTheme()` or pass a new `theme` prop. See `components/slide-styles.css` for the pattern.

## Reading row-level fields inside `renderSlide`

`renderSlide` only receives `(data, ctx)` where `ctx = { y, x, isCover, theme }`. To access row-level fields (your schema's category label, hue, etc.), close over the `spines` array using a factory:

```jsx
function makeRenderer(spines) {
  return function renderSlide(data, ctx) {
    const row = spines[ctx.y];
    return <MySlide data={data} row={row} ctx={ctx} />;
  };
}
```

Then memoize: `const renderSlide = useMemo(() => makeRenderer(SPINES), [])`. See `components/Demo.jsx`.
