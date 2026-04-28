// Sample editorial content. Each spine row has uneven left/right ribs.
// items.left[0] is the rib closest to the spine (x = -1), items.left[1] is x = -2, ...
// items.right mirrors that on the right (x = +1, +2, ...). cover sits at x = 0.

const HUES_LIGHT = ['#e8d9c4', '#d4dbe5', '#e5d4d4', '#d4e5d6', '#dcd4e5', '#cfd9d4', '#dccfd2'];
const HUES_DARK  = ['#3a3128', '#2a3038', '#3a2a2a', '#2a3a2c', '#322a3a', '#243030', '#322628'];

const RAW = [
  // 2L + cover + 3R
  {
    kicker: 'ARCHITECTURE',
    spine: 'The Quiet Geometry',
    cover: { t: 'The Quiet Geometry of Tokyo Stations', tag: 'feature' },
    items: {
      left: [
        { t: 'Threshold',                   tag: 'opening'  }, // x = -1
        { t: 'A note on doorways',          tag: 'fragment' }, // x = -2
      ],
      right: [
        { t: 'Photographs, half-erased',    tag: 'gallery'  }, // x = +1
        { t: 'Notes from a small platform', tag: 'sidebar'  }, // x = +2
        { t: 'Index of empty rooms',        tag: 'colophon' }, // x = +3
      ],
    },
  },
  // 5L + cover + 1R
  {
    kicker: 'PROFILE',
    spine: 'Forty-Two Years',
    cover: { t: 'Forty-Two Years of the Same Bowl', tag: 'feature' },
    items: {
      left: [
        { t: 'A photograph of the stove',   tag: 'gallery'  }, // x = -1
        { t: 'Tetsuo, before',              tag: 'archive'  }, // x = -2
        { t: 'On not changing the recipe',  tag: 'sidebar'  }, // x = -3
        { t: 'The first morning queue',     tag: 'fragment' }, // x = -4
        { t: 'A small bowl',                tag: 'sketch'   }, // x = -5
      ],
      right: [
        { t: 'Letters from regulars',       tag: 'epilogue' }, // x = +1
      ],
    },
  },
  // 0L + cover + 2R
  {
    kicker: 'ESSAY',
    spine: 'Against the Scroll',
    cover: { t: 'Against the Infinite Scroll', tag: 'feature' },
    items: {
      left: [],
      right: [
        { t: 'Footnotes',                   tag: 'notes'    }, // x = +1
        { t: 'A reader writes back',        tag: 'reply'    }, // x = +2
      ],
    },
  },
  // 3L + cover + 3R
  {
    kicker: 'OBJECT',
    spine: 'The Index Card',
    cover: { t: 'A Brief History of the Index Card', tag: 'feature' },
    items: {
      left: [
        { t: 'Before the database',         tag: 'opening'  }, // x = -1
        { t: 'A wooden cabinet',            tag: 'object'   }, // x = -2
        { t: 'Linnaeus’s slips',            tag: 'archive'  }, // x = -3
      ],
      right: [
        { t: 'How to make one',             tag: 'manual'   }, // x = +1
        { t: 'A taxonomy of taxonomies',    tag: 'sidebar'  }, // x = +2
        { t: 'Colophon',                    tag: 'colophon' }, // x = +3
      ],
    },
  },
  // 4L + cover + 0R
  {
    kicker: 'FIELD',
    spine: 'The Refusing Gardener',
    cover: { t: 'The Gardener Who Refuses to Plan', tag: 'feature' },
    items: {
      left: [
        { t: 'The moss this morning',       tag: 'opening'  }, // x = -1
        { t: 'On planning',                 tag: 'sidebar'  }, // x = -2
        { t: 'Forty seasons in',            tag: 'fragment' }, // x = -3
        { t: 'A garden in May',             tag: 'sketch'   }, // x = -4
      ],
      right: [],
    },
  },
  // 4L + cover + 4R
  {
    kicker: 'CINEMA',
    spine: 'Rooms of Edward Yang',
    cover: { t: 'Rooms in the Films of Edward Yang', tag: 'feature' },
    items: {
      left: [
        { t: 'Empty seats',                 tag: 'fragment' }, // x = -1
        { t: 'On corners',                  tag: 'sidebar'  }, // x = -2
        { t: 'Light through blinds',        tag: 'still'    }, // x = -3
        { t: 'A hallway in Taipei',         tag: 'still'    }, // x = -4
      ],
      right: [
        { t: 'A taxonomy of windows',       tag: 'index'    }, // x = +1
        { t: 'Sound design notes',          tag: 'manual'   }, // x = +2
        { t: 'Letterbox vs window',         tag: 'essay'    }, // x = +3
        { t: 'Closing credits',             tag: 'colophon' }, // x = +4
      ],
    },
  },
  // 1L + cover + 2R
  {
    kicker: 'COLOPHON',
    spine: 'The Making of This Issue',
    cover: { t: 'On the Making of This Issue', tag: 'feature' },
    items: {
      left: [
        { t: 'Five cities',                 tag: 'note'     }, // x = -1
      ],
      right: [
        { t: 'Errata',                      tag: 'notes'    }, // x = +1
        { t: 'Index',                       tag: 'index'    }, // x = +2
      ],
    },
  },
];

export const SPINES = RAW.map((row, i) => ({
  ...row,
  hueLight: HUES_LIGHT[i % HUES_LIGHT.length],
  hueDark: HUES_DARK[i % HUES_DARK.length],
}));
