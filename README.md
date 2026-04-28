# SpinRib

A 2D spine-and-rib slider for the web. Vertical spine of rows; each row has uneven-length ribs extending left and right. ↑↓ jumps between spine rows, ←→ traverses ribs of the current row.

Zero dependencies. Vanilla ES modules. No build step required.

## Quick start

```html
<script type="module">
  import { SpinRib } from './src/spinrib.js';

  const spines = [
    {
      kicker: 'ARCHITECTURE',
      spine: 'The Quiet Geometry',
      hueLight: '#e8d9c4',
      hueDark:  '#3a3128',
      cover: { t: 'The Quiet Geometry of Tokyo', tag: 'feature' },
      items: {
        left: [
          { t: 'Threshold',          tag: 'opening'  }, // x = -1
          { t: 'A note on doorways', tag: 'fragment' }, // x = -2
        ],
        right: [
          { t: 'Photographs, half-erased',    tag: 'gallery'  }, // x = +1
          { t: 'Notes from a small platform', tag: 'sidebar'  }, // x = +2
          { t: 'Index of empty rooms',        tag: 'colophon' }, // x = +3
        ],
      },
    },
    // ...more spine rows
  ];

  new SpinRib({
    container: document.querySelector('#slider'),
    spines,
    theme: 'light',
    miniSize: 'md',
    chrome: 'arrows',
    transition: 'slide',
  });
</script>
```

See [`examples/index.html`](examples/index.html) for a full demo with all controls wired up.

## Data model

A spine is a row on the vertical axis. Each spine has a single `cover` (the spine slide at `x = 0`) and ribs extending left and right of varying length. When the user moves up or down, they always land on the next spine's cover.

```js
{
  kicker: 'PROFILE',                                          // section/category label
  spine: 'Forty-Two Years',                                   // row title
  hueLight: '#d4dbe5',                                        // background hue (light theme)
  hueDark:  '#2a3038',                                        // background hue (dark theme)
  cover: { t: 'Forty-Two Years of the Same Bowl', tag: 'feature' },  // x = 0
  items: {
    left:  [/* outward from spine: items.left[0]  is at x = -1, [1] is at x = -2, ... */],
    right: [/* outward from spine: items.right[0] is at x = +1, [1] is at x = +2, ... */],
  },
}
```

**Rib counts are derived from array lengths** — there is no separate `leftCount` / `rightCount` to keep in sync. To add a rib at the far end, just `items.left.push(...)` or `items.right.push(...)`.

`items.left` may be `[]` (no left ribs) and `items.right` may be `[]` (no right ribs). Either side may also be omitted entirely.

## Options

| Option        | Type                                                    | Default        | Description                                          |
|---------------|---------------------------------------------------------|----------------|------------------------------------------------------|
| `container`   | `HTMLElement`                                           | required       | Element to mount into                                 |
| `spines`      | `SpineRow[]`                                            | required       | Array of spine rows                                   |
| `theme`       | `'light' \| 'dark'`                                     | `'light'`      |                                                       |
| `miniSize`    | `'sm' \| 'md' \| 'lg'`                                  | `'md'`         | Mini-map density                                      |
| `chrome`      | `'arrows' \| 'arrows-with-hints' \| 'keyboard' \| 'both'` | `'arrows'`   | Navigation affordance style                           |
| `transition`  | `'slide' \| 'fade' \| 'cut'`                            | `'slide'`      | Slide-change animation                                |
| `label`       | `string`                                                | `'SPINE+RIB'`  | Brand chip subtitle                                   |
| `enableKeys`  | `boolean`                                               | `true`         | Bind arrow keys on `window`                           |
| `renderSlide` | `(slide, theme) => HTMLElement`                         | built-in       | Custom slide renderer                                 |
| `onChange`    | `(event) => void`                                       | —              | Called when position changes                          |

## API

```js
const slider = new SpinRib({ /* ... */ });

slider.moveBy(dx, dy);     // dy moves to spine of next/prev row, dx moves along current rib
slider.jumpTo(y, x);       // jump to a specific (y, x); ignored if out of range
slider.setTheme('dark');
slider.setMiniSize('lg');
slider.setChrome('keyboard');
slider.setTransition('fade');
slider.destroy();          // unmounts and unbinds
```

## Navigation rules

- **↑ / ↓** — moves along the spine. Always lands on the spine slide (`x = 0`) of the target row. Disabled at the top/bottom rows.
- **← / →** — moves along the current row's ribs. Disabled when `x` reaches `-leftCount` / `+rightCount`.
- **Mini-map cell click** — jumps directly to that slide.

## Files

```
src/
  spinrib.js   — main class, no dependencies
  theme.js     — color tokens for light/dark
  styles.js    — CSS injected into <head> on first instance
examples/
  index.html   — interactive demo
  sample-data.js
```

## License

MIT
