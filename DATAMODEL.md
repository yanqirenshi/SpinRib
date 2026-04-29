# SpinRib Data Model Specification

Version: `0.2` — aligned with library version `0.2.0`.

This document specifies the contract between SpinRib and its consumer. The library is **content-agnostic**: it only inspects the structure of `spines` (covers and ribs) and delegates all slide rendering to a consumer-supplied callback.

---

## 1. Two-layer model

SpinRib data has two clearly separated layers. **Only the first layer is part of the library's contract**.

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1 — STRUCTURE (library's contract)                    │
│                                                             │
│   What SpinRib knows: cover + items.left[] + items.right[]  │
│   That's it. Nothing else.                                  │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ inspected by
┌─────────────────────────────────────────────────────────────┐
│ Layer 2 — CONTENT (consumer's responsibility)               │
│                                                             │
│   Whatever you put inside `cover` and the items arrays.     │
│   Strings, objects, image URLs, JSX elements — opaque to    │
│   the library, interpreted only by your renderSlide().      │
└─────────────────────────────────────────────────────────────┘
```

You can think of SpinRib as a 2D positional index over arbitrary content.

---

## 2. Layer 1 — Structure (normative)

### 2.1 Top-level

```ts
type Spines = SpineRow[];
```

A non-empty array of `SpineRow`s. Index in the array == row coordinate `y`.

### 2.2 `SpineRow`

```ts
interface SpineRow {
  cover: any;                                    // REQUIRED. The slide at x = 0.
  items?: {
    left?:  any[];                               // outward from spine: [0]→x=-1, [1]→x=-2, ...
    right?: any[];                               // outward from spine: [0]→x=+1, [1]→x=+2, ...
  };
  // Any additional properties are ignored by the library (Layer 2).
}
```

**Constraints (enforced):**
- `cover` MUST be present and not `null` / `undefined`. The library throws on construction if any row is missing one.
- Both `items`, `items.left`, `items.right` are optional. Omitted keys behave as empty arrays.

**Constraints (recommended, not enforced):**
- Within a row, both ribs MAY be empty (a row with only a cover is valid).
- Rib lengths MAY vary across rows (this is the whole point of "uneven ribs").

### 2.3 Coordinate system

For a given `SpineRow row` at index `y`:

```
x =  0       →  row.cover
x = -1       →  row.items.left[0]
x = -2       →  row.items.left[1]
…
x = -N       →  row.items.left[N - 1]

x = +1       →  row.items.right[0]
x = +2       →  row.items.right[1]
…
x = +M       →  row.items.right[M - 1]
```

**Bounds for row `r`:**

| Bound       | Expression                                |
|-------------|-------------------------------------------|
| min `x`     | `-(r.items?.left?.length  ?? 0)`          |
| max `x`     | `+(r.items?.right?.length ?? 0)`          |
| min `y`     | `0`                                        |
| max `y`     | `spines.length - 1`                       |

`moveBy()` and `jumpTo()` clamp/reject out-of-bound coordinates silently.

### 2.4 Navigation semantics

| Input         | Effect on `(y, x)`                                        |
|---------------|-----------------------------------------------------------|
| `↓`           | `y → y + 1`, `x → 0` (always lands on next row's cover)   |
| `↑`           | `y → y - 1`, `x → 0`                                       |
| `→`           | `x → x + 1` (clamped to right rib bound)                  |
| `←`           | `x → x - 1` (clamped to left rib bound)                   |
| Mini-map cell | `(y, x) → clicked cell` (rejected if out of bounds)       |

The cover is the canonical entry point of each row; readers cannot teleport directly into a rib via vertical motion.

---

## 3. Layer 2 — Content (consumer's domain)

Whatever you place inside `cover` and the items arrays is **opaque to the library**. The library passes that value back to your `renderSlide` callback verbatim.

### 3.1 The `renderSlide` callback

```ts
new SpinRib({
  /* ... */
  renderSlide: (data: any, ctx: SlideContext) => HTMLElement
});

interface SlideContext {
  y:        number;   // row index
  x:        number;   // signed offset from spine
  isCover:  boolean;  // x === 0
  theme:    'light' | 'dark';
}
```

`data` is whatever the consumer placed at `(ctx.y, ctx.x)`:

| Position    | Source                       |
|-------------|------------------------------|
| `x = 0`     | `spines[y].cover`            |
| `x = -k`    | `spines[y].items.left[k - 1]` |
| `x = +k`    | `spines[y].items.right[k - 1]` |

The callback returns one `HTMLElement`. The library wraps it in a positioned container (`.spr-slide`) and applies transition animations to that wrapper.

### 3.2 Working with row-level data

The library does not pass the full `SpineRow` to `renderSlide` — only `(y, x, isCover, theme)`. To read row-level fields (kicker, hue, etc. in your own schema) close over the spines array:

```js
function makeRenderer(spines) {
  return function renderSlide(data, ctx) {
    const row = spines[ctx.y];
    // ... use row.myField as needed
  };
}

new SpinRib({ spines, renderSlide: makeRenderer(spines), /* ... */ });
```

The reference demo at `examples/slide-renderer.js` uses this factory pattern.

### 3.3 The `rowLabel` callback

The mini-map's "current row" indicator can be customized:

```ts
new SpinRib({
  /* ... */
  rowLabel: (row: any, y: number) => string   // default: `Row ${y + 1}`
});
```

Returns a short string shown in the upper-right of the mini-map alongside the X-axis indicator (`SPN` / `L1` / `R2` / ...).

---

## 4. CSS variable contract (public)

The library sets these CSS custom properties on `.spr-root` and updates them when the theme changes. Consumer slide markup MAY use them to participate in light/dark theming without manual JS:

| Variable             | Purpose                                  |
|----------------------|------------------------------------------|
| `--spr-bg`           | Background (page/stage)                  |
| `--spr-fg`           | Primary foreground (text)                |
| `--spr-fg-subtle`    | Secondary text, meta, captions           |
| `--spr-fg-faint`     | Tertiary / disabled text                 |
| `--spr-border`       | Thin separators, subtle outlines         |
| `--spr-panel`        | Translucent panel background             |
| `--spr-panel-solid`  | Opaque panel background                  |
| `--spr-accent`       | Brand-ish accent (use sparingly)         |

Other variables (`--spr-arrow*`, `--spr-mini-*`, `--spr-panel-shadow`) are internal to the library's chrome and may change without notice.

---

## 5. Validation rules (enforced)

The constructor throws on:

1. Missing `container` option.
2. `spines` not an array, or empty.
3. Missing `renderSlide` (must be a function).
4. Any `spines[y].cover` that is `null` or `undefined`.

The library does NOT validate item structure beyond that. If your `renderSlide` crashes on a malformed item, the exception propagates.

---

## 6. Examples

### 6.1 Smallest possible — strings as data

```js
new SpinRib({
  container: el,
  spines: [
    { cover: 'A' },
    { cover: 'B', items: { right: ['B1', 'B2'] } },
  ],
  renderSlide: (data) => {
    const div = document.createElement('div');
    div.textContent = data;
    div.style.cssText = 'display:grid;place-items:center;background:var(--spr-bg);color:var(--spr-fg);font-size:120px;';
    return div;
  },
});
```

### 6.2 Image gallery — objects as data

```js
const spines = [
  {
    cover: { src: '/cover.jpg', caption: 'Tokyo' },
    items: {
      left:  [{ src: '/a.jpg' }, { src: '/b.jpg' }],
      right: [{ src: '/c.jpg' }],
    },
  },
];

function renderSlide(data, { isCover }) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;background:#000;';
  const img = document.createElement('img');
  img.src = data.src;
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
  wrap.appendChild(img);
  if (data.caption) {
    const cap = document.createElement('div');
    cap.textContent = data.caption;
    cap.style.cssText = 'position:absolute;bottom:24px;left:24px;color:#fff;';
    wrap.appendChild(cap);
  }
  return wrap;
}
```

### 6.3 Editorial demo — see `examples/`

The reference editorial demo lives in `examples/`:

- `examples/sample-data.js` — illustrates one possible content schema (`{ kicker, spine, hueLight, hueDark, cover: { t, tag }, items: { left: [{t,tag}], right: [{t,tag}] } }`)
- `examples/slide-renderer.js` — a `renderSlide` for that schema
- `examples/slide-styles.css` — slide-specific styles
- `examples/index.html` — wires everything together

This editorial schema is **not part of the library**. It's an example of what Layer 2 can look like when you want a magazine-style layout.

---

## 7. JSON Schema for Layer 1 (Draft 2020-12)

The library's structural contract, leaving Layer 2 unconstrained:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/yanqirenshi/SpinRib/blob/master/DATAMODEL.md#schema-v0.2",
  "title": "SpinRib Spines (structural)",
  "type": "array",
  "minItems": 1,
  "items": { "$ref": "#/$defs/SpineRow" },
  "$defs": {
    "SpineRow": {
      "type": "object",
      "required": ["cover"],
      "additionalProperties": true,
      "properties": {
        "cover": { "not": { "type": "null" } },
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "left":  { "type": "array" },
            "right": { "type": "array" }
          }
        }
      }
    }
  }
}
```

The schema deliberately uses `additionalProperties: true` and untyped arrays — Layer 2 is yours.

---

## 8. Versioning

This document follows the library's semver. Versions:

- **`0.2`** — current. Library is content-agnostic; `renderSlide` required; `kicker` / `spine` / `hue*` / `t` / `tag` removed from the library's awareness.
- **`0.1`** — historical. The library knew about editorial fields directly. Replaced by 0.2's two-layer model.
