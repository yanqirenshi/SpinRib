// SpinRib data model — spine (vertical) with ribs of UNEVEN LENGTH
// extending left and right from each spine segment.
//
// Each spine row has:
//   { kicker, title, leftCount, rightCount, slides: [...] }
// Where slides are arranged: [-leftCount ... -1, 0 (spine), +1 ... +rightCount]
// The spine slide (offset 0) is the canonical / cover slide for that row.
//
// Coordinate system: { y: spine index, x: signed offset from spine }

const SPINES = [
  // y=0 — short ribs both sides
  {
    kicker: 'ARCHITECTURE',
    spine: 'The Quiet Geometry',
    leftCount: 2,
    rightCount: 3,
    items: [
      { t: 'A note on doorways',          tag: 'fragment' },
      { t: 'Threshold',                   tag: 'opening'  },
      { t: 'The Quiet Geometry of Tokyo Stations', tag: 'feature', cover: true },
      { t: 'Photographs, half-erased',    tag: 'gallery'  },
      { t: 'Notes from a small platform', tag: 'sidebar'  },
      { t: 'Index of empty rooms',        tag: 'colophon' },
    ],
  },
  // y=1 — long left arm, short right
  {
    kicker: 'PROFILE',
    spine: 'Forty-Two Years',
    leftCount: 5,
    rightCount: 1,
    items: [
      { t: 'A small bowl',                tag: 'sketch'   },
      { t: 'The first morning queue',     tag: 'fragment' },
      { t: 'On not changing the recipe',  tag: 'sidebar'  },
      { t: 'Tetsuo, before',              tag: 'archive'  },
      { t: 'A photograph of the stove',   tag: 'gallery'  },
      { t: 'Forty-Two Years of the Same Bowl', tag: 'feature', cover: true },
      { t: 'Letters from regulars',       tag: 'epilogue' },
    ],
  },
  // y=2 — single short rib right (no left arm)
  {
    kicker: 'ESSAY',
    spine: 'Against the Scroll',
    leftCount: 0,
    rightCount: 2,
    items: [
      { t: 'Against the Infinite Scroll', tag: 'feature', cover: true },
      { t: 'Footnotes',                   tag: 'notes'    },
      { t: 'A reader writes back',        tag: 'reply'    },
    ],
  },
  // y=3 — symmetric medium
  {
    kicker: 'OBJECT',
    spine: 'The Index Card',
    leftCount: 3,
    rightCount: 3,
    items: [
      { t: 'Linnaeus’s slips',            tag: 'archive'  },
      { t: 'A wooden cabinet',            tag: 'object'   },
      { t: 'Before the database',         tag: 'opening'  },
      { t: 'A Brief History of the Index Card', tag: 'feature', cover: true },
      { t: 'How to make one',             tag: 'manual'   },
      { t: 'A taxonomy of taxonomies',    tag: 'sidebar'  },
      { t: 'Colophon',                    tag: 'colophon' },
    ],
  },
  // y=4 — only left arm
  {
    kicker: 'FIELD',
    spine: 'The Refusing Gardener',
    leftCount: 4,
    rightCount: 0,
    items: [
      { t: 'A garden in May',             tag: 'sketch'   },
      { t: 'Forty seasons in',            tag: 'fragment' },
      { t: 'On planning',                 tag: 'sidebar'  },
      { t: 'The moss this morning',       tag: 'opening'  },
      { t: 'The Gardener Who Refuses to Plan', tag: 'feature', cover: true },
    ],
  },
  // y=5 — long both ways
  {
    kicker: 'CINEMA',
    spine: 'Rooms of Edward Yang',
    leftCount: 4,
    rightCount: 4,
    items: [
      { t: 'A hallway in Taipei',         tag: 'still'    },
      { t: 'Light through blinds',        tag: 'still'    },
      { t: 'On corners',                  tag: 'sidebar'  },
      { t: 'Empty seats',                 tag: 'fragment' },
      { t: 'Rooms in the Films of Edward Yang', tag: 'feature', cover: true },
      { t: 'A taxonomy of windows',       tag: 'index'    },
      { t: 'Sound design notes',          tag: 'manual'   },
      { t: 'Letterbox vs window',         tag: 'essay'    },
      { t: 'Closing credits',             tag: 'colophon' },
    ],
  },
  // y=6 — small + tight
  {
    kicker: 'COLOPHON',
    spine: 'The Making of This Issue',
    leftCount: 1,
    rightCount: 2,
    items: [
      { t: 'Five cities',                 tag: 'note'     },
      { t: 'On the Making of This Issue', tag: 'feature', cover: true },
      { t: 'Errata',                      tag: 'notes'    },
      { t: 'Index',                       tag: 'index'    },
    ],
  },
];

// Hue palette
const HUES_LIGHT = ['#e8d9c4', '#d4dbe5', '#e5d4d4', '#d4e5d6', '#dcd4e5', '#cfd9d4', '#dccfd2'];
const HUES_DARK  = ['#3a3128', '#2a3038', '#3a2a2a', '#2a3a2c', '#322a3a', '#243030', '#322628'];

// Flatten and tag every slide with { y, x } where x is signed offset from spine
const SLIDES_RIB = [];
SPINES.forEach((s, y) => {
  s.items.forEach((it, idx) => {
    const x = idx - s.leftCount; // negative = left of spine, 0 = spine, positive = right
    SLIDES_RIB.push({
      y, x,
      kicker: s.kicker,
      spine: s.spine,
      title: it.t,
      tag: it.tag,
      isCover: !!it.cover,
      hueLight: HUES_LIGHT[y % HUES_LIGHT.length],
      hueDark:  HUES_DARK[y % HUES_DARK.length],
      coord: `${y + 1}${x >= 0 ? '+' : ''}${x}`,
    });
  });
});

// Build a quick lookup
function findSlide(y, x) {
  return SLIDES_RIB.find(s => s.y === y && s.x === x) || null;
}

window.SPINES = SPINES;
window.SLIDES_RIB = SLIDES_RIB;
window.findSlide = findSlide;
