# SpinRib Data Model Specification

Version: `0.1` — initial spec, aligned with library version `0.1.0`.

This document is the authoritative specification for the `spines` data structure consumed by `new SpinRib({ spines, ... })`. Library implementations and authoring tools should treat this file as the contract.

---

## 1. Overview

A SpinRib dataset describes a **2-dimensional set of slides** organized as a vertical _spine_ of rows, where each row has a single _cover_ slide and a number of _ribs_ (additional slides) extending outward to the left and right of the cover.

```
y=0  [ left ribs … ]  ◆ COVER  [ … right ribs ]
                         │
y=1  [ … left ribs ]  ◆ COVER  [ right ribs … ]
                         │
y=2                   ◆ COVER  [ right ribs ]
                         │
…
```

- **`y`** identifies a row (the spine index, top-to-bottom).
- **`x`** identifies a column offset from the cover (negative = left, `0` = cover, positive = right).
- The cover is always at `x = 0` for every row.
- Rib counts on the left and right are independent and may differ from row to row, including being zero.

---

## 2. Top-level shape

```ts
type Spines = SpineRow[];
```

A non-empty array of `SpineRow` objects, ordered top-to-bottom along the spine.

**Constraints:**
- `Spines.length >= 1` (must have at least one row).
- Index in the array == row coordinate `y`.

---

## 3. `SpineRow`

```ts
interface SpineRow {
  kicker:    string;        // category / section label
  spine:     string;        // row title
  hueLight:  string;        // CSS color for light theme background
  hueDark:   string;        // CSS color for dark theme background
  cover:     Item;          // the spine slide at x = 0  (REQUIRED)
  items?: {
    left?:  Item[];         // ribs extending to the left  (optional, default [])
    right?: Item[];         // ribs extending to the right (optional, default [])
  };
}
```

### 3.1 Field-by-field

| Field        | Type                  | Required | Notes                                                                 |
|--------------|-----------------------|:--------:|-----------------------------------------------------------------------|
| `kicker`     | `string`              | ✅        | Short upper-case label (e.g. `'ARCHITECTURE'`). Shown above the title.|
| `spine`      | `string`              | ✅        | Sub-title for the row, displayed alongside `kicker`.                  |
| `hueLight`   | `string` (CSS color)  | ✅        | Image-area background color in light theme. Hex, `rgb()`, or named.   |
| `hueDark`    | `string` (CSS color)  | ✅        | Image-area background color in dark theme.                            |
| `cover`      | `Item`                | ✅        | The slide at `x = 0`. **Must not be null/undefined.**                 |
| `items`      | `{ left?, right? }`   | ⬜        | Container for rib slides. May be omitted entirely if no ribs.         |
| `items.left` | `Item[]`              | ⬜        | Left ribs, ordered _outward from spine_ (see §5). Default: `[]`.      |
| `items.right`| `Item[]`              | ⬜        | Right ribs, ordered _outward from spine_. Default: `[]`.              |

### 3.2 Why `kicker` and `spine` are separate

`kicker` is a coarse category label that's often shared across many rows (e.g. `'ESSAY'`), while `spine` is the specific title of this row. The renderer concatenates them as `${kicker} · ${spine}` in the upper meta line of every slide in the row.

### 3.3 Hue choice

Hues are intentionally muted; they are visible behind a faint diagonal grain pattern. Saturation around `8–18%` and lightness `~85%` (light) / `~18%` (dark) produce results consistent with the built-in look.

---

## 4. `Item`

```ts
interface Item {
  t:   string;   // slide title (the big serif heading)
  tag: string;   // role label (small mono badge, free-form)
}
```

| Field | Type     | Required | Notes |
|-------|----------|:--------:|-------|
| `t`   | `string` | ✅        | Main title. May contain Unicode, punctuation, em-dashes, etc. Long titles wrap. |
| `tag` | `string` | ✅        | Free-form role label. The renderer treats it as opaque text.                    |

### 4.1 `t` — title

Displayed as the slide's primary heading in a large serif face. Naming is short (`t`, not `title`) because items can appear hundreds of times in a dataset; the terse key keeps authoring tractable.

### 4.2 `tag` — role label

Treated as an opaque string by the library. Authors are encouraged — but not required — to use a consistent vocabulary so that visual rhythm is preserved. The reference vocabulary used in `examples/sample-data.js`:

| `tag`        | Intended role                                  |
|--------------|------------------------------------------------|
| `feature`    | Main / cover-class article                     |
| `opening`    | Introduction or framing piece                  |
| `fragment`   | Short note, marginalia                         |
| `gallery`    | Image-led piece                                |
| `sidebar`    | Companion / column / supplementary commentary  |
| `archive`    | Historical material, reference                 |
| `manual`     | How-to, instructions                           |
| `colophon`   | Editorial / production information             |
| `notes` / `note` | Footnotes, annotations                     |
| `still`      | Single still image (cinematic context)         |
| `essay`      | Long-form argument                             |
| `index`      | Index / table-of-contents-like                 |
| `epilogue`   | Closing material                               |
| `reply`      | Letter / response                              |
| `sketch`     | Loose visual                                   |
| `object`     | Material thing                                 |

Custom vocabularies are explicitly supported. The library does not validate `tag` values.

### 4.3 Extension fields

Authors may add additional keys to `Item` (e.g. `image`, `href`, `date`, `author`, `excerpt`). The default renderer ignores unknown keys; to surface them, supply a `renderSlide` callback to the SpinRib constructor.

```ts
new SpinRib({
  /* ... */
  renderSlide: (slide: SlideContext, theme: ThemeTokens) => HTMLElement
});
```

A custom `renderSlide` receives the fully-flattened slide context (see §5.2) and is free to read any extension fields that survived flattening. Note: by default `flatten()` only copies `t` → `title` and `tag` onto the slide context; extension fields require either a custom flattener or storing them on the row instead of the item.

---

## 5. Coordinate system

### 5.1 Mapping items to coordinates

For a given `SpineRow row`:

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

In other words: **arrays are ordered from the spine outward.** `items.left[0]` is the rib _adjacent_ to the cover; later indices are progressively further away.

### 5.2 Flattened slide context

`flatten(spines)` is the library's internal projection that produces a one-dimensional list of slide records. Each record exposes:

```ts
interface SlideContext {
  y:        number;   // row index (0-based)
  x:        number;   // signed offset from spine
  kicker:   string;   // copied from row
  spine:    string;   // copied from row
  title:    string;   // copied from item.t
  tag:      string;   // copied from item.tag
  isCover:  boolean;  // x === 0 in the current model
  hueLight: string;   // copied from row
  hueDark:  string;   // copied from row
  coord:    string;   // formatted display: e.g. "1+0", "2-3"
}
```

`coord` formatting: `${y + 1}${x >= 0 ? '+' : ''}${x}` — i.e. one-based row, signed offset, with `+` shown explicitly for non-negative `x`.

### 5.3 Bounds

For row `r` at index `y`:

| Bound       | Expression                                |
|-------------|-------------------------------------------|
| min `x`     | `-(r.items?.left?.length  ?? 0)`          |
| max `x`     | `+(r.items?.right?.length ?? 0)`          |
| min `y`     | `0`                                        |
| max `y`     | `spines.length - 1`                       |

Any `(y, x)` outside these bounds is invalid and ignored by `moveBy()` / `jumpTo()`.

---

## 6. Navigation semantics (data implications)

The data model influences how navigation behaves:

| Input       | Effect on `(y, x)`                                           |
|-------------|--------------------------------------------------------------|
| `↓`         | `y → y + 1`, `x → 0` (always lands on next row's cover)      |
| `↑`         | `y → y - 1`, `x → 0`                                          |
| `→`         | `x → x + 1` (clamped to right rib bound)                     |
| `←`         | `x → x - 1` (clamped to left rib bound)                      |
| Mini-map click | `(y, x) → clicked cell` (rejected if out of bounds)       |

**Implication for authors:** the cover is the canonical entry point of each row. Vertical navigation never visits a rib directly — readers must enter via the cover and step laterally. If a rib is reachable only through a long sequence of presses, design accordingly (or split the row).

---

## 7. Constraints & validation

Implementations SHOULD reject input that violates the following:

1. `spines` must be a non-empty array.
2. Every `SpineRow` must have a `cover` field that is a valid `Item`.
3. `cover.t` and `cover.tag` must be strings.
4. If `items` is present, both `items.left` and `items.right` (when present) must be arrays. Each entry must be a valid `Item`.
5. `kicker`, `spine`, `hueLight`, `hueDark` must be strings.

The current reference implementation throws on missing `cover` (see `flatten()` in `src/spinrib.js`). Other constraints are enforced lazily during render — invalid types may produce visual artefacts but not crashes.

---

## 8. Examples

### 8.1 Minimal — single row, no ribs

```js
const SPINES = [
  {
    kicker: 'WELCOME',
    spine: 'Hello',
    hueLight: '#e8d9c4',
    hueDark:  '#3a3128',
    cover: { t: 'Hello, world.', tag: 'feature' },
    // items omitted entirely
  },
];
```

This produces exactly 1 slide. All arrow directions are disabled.

### 8.2 Asymmetric ribs — left-only row

```js
{
  kicker: 'FIELD',
  spine: 'The Refusing Gardener',
  hueLight: '#dcd4e5',
  hueDark:  '#322a3a',
  cover: { t: 'The Gardener Who Refuses to Plan', tag: 'feature' },
  items: {
    left: [
      { t: 'The moss this morning', tag: 'opening'  }, // x = -1
      { t: 'On planning',           tag: 'sidebar'  }, // x = -2
      { t: 'Forty seasons in',      tag: 'fragment' }, // x = -3
      { t: 'A garden in May',       tag: 'sketch'   }, // x = -4
    ],
    right: [],   // can also be omitted
  },
},
```

`x` ranges over `[-4, 0]`. The right arrow is always disabled on this row.

### 8.3 Symmetric — three on each side

```js
{
  kicker: 'OBJECT',
  spine: 'The Index Card',
  hueLight: '#d4e5d6',
  hueDark:  '#2a3a2c',
  cover: { t: 'A Brief History of the Index Card', tag: 'feature' },
  items: {
    left: [
      { t: 'Before the database',  tag: 'opening' },
      { t: 'A wooden cabinet',     tag: 'object'  },
      { t: 'Linnaeus’s slips',     tag: 'archive' },
    ],
    right: [
      { t: 'How to make one',           tag: 'manual'   },
      { t: 'A taxonomy of taxonomies',  tag: 'sidebar'  },
      { t: 'Colophon',                  tag: 'colophon' },
    ],
  },
},
```

---

## 9. Authoring guidelines (non-normative)

These are not enforced by the library, but produce datasets that read well:

1. **Use `feature` for covers.** A few specialized covers (`opening`, `colophon`) are fine but the default works because covers are visually distinguished (◆ glyph).
2. **Vary rib counts.** Uneven ribs are the whole point; rows with identical shapes flatten into a grid and lose the spine-and-rib character.
3. **Place stronger pieces closer to the spine.** Readers reach `items.left[0]` after one keypress; `items.left[5]` after six.
4. **Keep `t` short.** Aim for ~40–80 characters for clean wrapping at the default 50px size.
5. **Keep `kicker` SCREAMING-CASE.** It's typeset as letterspaced uppercase regardless, but uppercase source spares the renderer.
6. **Maintain a tag vocabulary.** Pick 8–15 tags and reuse them. Random-looking tags break visual rhythm.

---

## 10. JSON Schema (Draft 2020-12)

For programmatic validation. Note: `Item` allows additional properties for forward compatibility.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/yanqirenshi/SpinRib/blob/master/DATAMODEL.md#schema-v0.1",
  "title": "SpinRib Spines",
  "type": "array",
  "minItems": 1,
  "items": { "$ref": "#/$defs/SpineRow" },
  "$defs": {
    "SpineRow": {
      "type": "object",
      "required": ["kicker", "spine", "hueLight", "hueDark", "cover"],
      "additionalProperties": true,
      "properties": {
        "kicker":   { "type": "string", "minLength": 1 },
        "spine":    { "type": "string", "minLength": 1 },
        "hueLight": { "type": "string", "minLength": 1 },
        "hueDark":  { "type": "string", "minLength": 1 },
        "cover":    { "$ref": "#/$defs/Item" },
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "left":  { "type": "array", "items": { "$ref": "#/$defs/Item" } },
            "right": { "type": "array", "items": { "$ref": "#/$defs/Item" } }
          }
        }
      }
    },
    "Item": {
      "type": "object",
      "required": ["t", "tag"],
      "additionalProperties": true,
      "properties": {
        "t":   { "type": "string", "minLength": 1 },
        "tag": { "type": "string", "minLength": 1 }
      }
    }
  }
}
```

---

## 11. Versioning

This document follows the library's semver. Breaking changes to the data shape will bump the library minor version while pre-1.0, and the major version once `1.0.0` ships. Past versions:

- **`0.1`** — initial: `cover` + `items.{left,right}`; `t` / `tag`.

Migration notes from earlier internal shapes (e.g. `leftCount` / `rightCount` + flat `items[]` with `cover: true` flag) are recorded in commit history; they are not supported by `0.1`.
