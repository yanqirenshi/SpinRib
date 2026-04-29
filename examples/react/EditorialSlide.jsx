// React version of the editorial slide renderer. Lives in examples/
// (not in the library) because it knows about a particular content
// schema — kicker / spine / hueLight / hueDark on rows, { t, tag } on
// items. See ../../DATAMODEL.md for the layered data model.
//
// The factory pattern (`makeEditorialRenderer(spines)`) gives the
// renderer access to the row at `ctx.y`, since SpinRib only passes
// (y, x, isCover, theme) to renderSlide.

import React from 'react';

export function makeEditorialRenderer(spines) {
  return function renderSlide(data, ctx) {
    if (!data) return <div className="demo-slide demo-slide-empty" />;
    const row = spines[ctx.y];
    return <EditorialSlide data={data} ctx={ctx} row={row} />;
  };
}

export function editorialRowLabel(row /* , y */) {
  return row?.kicker?.slice(0, 4) ?? '';
}

function EditorialSlide({ data, ctx, row }) {
  const hue = ctx.theme === 'dark' ? row.hueDark : row.hueLight;
  const grain =
    ctx.theme === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.022)';
  const glyph = ctx.isCover ? '◆' : ctx.x < 0 ? '◀' : '▶';
  const ribLabel = ctx.x === 0 ? 'SPINE' : ctx.x < 0 ? 'L-RIB' : 'R-RIB';
  const coord = `${ctx.y + 1}${ctx.x >= 0 ? '+' : ''}${ctx.x}`;

  return (
    <div
      className="demo-slide"
      style={{ '--demo-hue': hue, '--demo-grain': grain }}
    >
      <div className="demo-slide-image">
        <div className="demo-slide-image-meta">
          <div className="demo-slide-image-coord">{coord}</div>
          <div className="demo-slide-image-glyph">{glyph}</div>
        </div>
        <div className="demo-slide-image-tag">image · {data.tag}</div>
      </div>
      <div className="demo-slide-text">
        <div className="demo-slide-kicker">
          {row.kicker} · {row.spine}
        </div>
        <h1 className="demo-slide-title">{data.t}</h1>
        <div className="demo-slide-footer">
          <span>SpinRib · No. 014</span>
          <span>
            {ribLabel} {Math.abs(ctx.x) || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
