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
      leftCount: 2,
      rightCount: 3,
      hueLight: '#e8d9c4',
      hueDark: '#3a3128',
      items: [
        { t: 'A note on doorways',          tag: 'fragment' },
        { t: 'Threshold',                   tag: 'opening'  },
        { t: 'The Quiet Geometry of Tokyo', tag: 'feature', cover: true },
        { t: 'Photographs, half-erased',    tag: 'gallery'  },
        { t: 'Notes from a small platform', tag: 'sidebar'  },
        { t: 'Index of empty rooms',        tag: 'colophon' },
      ],
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

A spine is a row in the vertical axis. Each spine has ribs extending left and right of varying length:

```
items array order:  [-leftCount ... -1, 0 (spine cover), +1 ... +rightCount]
```

The slide at offset `0` is the **spine slide** (the canonical/cover slide for that row). When the user moves up or down, they always land on the next spine slide (`x = 0`).

```js
{
  kicker: 'PROFILE',          // section/category label
  spine: 'Forty-Two Years',   // row title
  leftCount: 5,               // ribs to the left of spine
  rightCount: 1,              // ribs to the right of spine
  hueLight: '#d4dbe5',        // background hue (light theme)
  hueDark:  '#2a3038',        // background hue (dark theme)
  items: [/* leftCount + 1 + rightCount entries, left-to-right */]
}
```

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
