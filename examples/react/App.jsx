'use client';

import React, { useMemo, useState } from 'react';
import { SpinRib } from '../../src/react/SpinRib.jsx';
// In a real Next.js project this would be:
//   import { SpinRib } from 'spinrib/react';

import { makeEditorialRenderer, editorialRowLabel } from './EditorialSlide.jsx';
import { SPINES } from './sample-data.js';

export function App() {
  const [theme, setTheme] = useState('light');
  const [miniSize, setMiniSize] = useState('md');
  const [chrome, setChrome] = useState('arrows');
  const [transition, setTransition] = useState('slide');

  // Memoize the renderer so the wrapper sees a stable function reference.
  const renderSlide = useMemo(() => makeEditorialRenderer(SPINES), []);

  return (
    <div className="page">
      <header className="page-head">
        <h1>SpinRib · React Demo</h1>
        <p>Same library, used from React via the &lt;SpinRib /&gt; wrapper.</p>
      </header>

      <div className="controls">
        <ControlGroup label="Theme">
          <Seg
            value={theme}
            onChange={setTheme}
            options={[['light', 'Light'], ['dark', 'Dark']]}
          />
        </ControlGroup>

        <ControlGroup label="Mini-map">
          <Seg
            value={miniSize}
            onChange={setMiniSize}
            options={[['sm', 'SM'], ['md', 'MD'], ['lg', 'LG']]}
          />
        </ControlGroup>

        <ControlGroup label="Chrome">
          <select value={chrome} onChange={(e) => setChrome(e.target.value)}>
            <option value="arrows">Arrows only</option>
            <option value="arrows-with-hints">Arrows + key labels</option>
            <option value="keyboard">Keyboard cluster</option>
            <option value="both">Arrows + keyboard</option>
          </select>
        </ControlGroup>

        <ControlGroup label="Transition">
          <select
            value={transition}
            onChange={(e) => setTransition(e.target.value)}
          >
            <option value="slide">Slide</option>
            <option value="fade">Fade</option>
            <option value="cut">Cut (instant)</option>
          </select>
        </ControlGroup>
      </div>

      <div className="stage-wrap">
        <SpinRib
          spines={SPINES}
          renderSlide={renderSlide}
          rowLabel={editorialRowLabel}
          theme={theme}
          miniSize={miniSize}
          chrome={chrome}
          transition={transition}
          style={{ position: 'absolute', inset: 0 }}
        />
      </div>

      <p className="helper">
        Tip — focus the page (click anywhere) and use the arrow keys.
      </p>
    </div>
  );
}

function ControlGroup({ label, children }) {
  return (
    <div className="control-group">
      <label className="title">{label}</label>
      {children}
    </div>
  );
}

function Seg({ value, onChange, options }) {
  return (
    <div className="seg">
      {options.map(([v, label]) => (
        <button
          key={v}
          className={value === v ? 'active' : ''}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
