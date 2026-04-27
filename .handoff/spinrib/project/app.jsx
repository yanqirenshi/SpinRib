// SpinRib — top-level app, mounts 3 variants in a DesignCanvas with shared Tweaks.

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "speed": 1,
  "easing": "ease-out",
  "snap": true
}/*EDITMODE-END*/;

function SpinRibApp() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  return (
    <>
      <DesignCanvas>
        <DCSection
          id="carousels"
          title="SpinRib"
          subtitle="Brutalist editorial carousel · 3 variations · drag, ←/→, wheel, click"
        >
          <DCArtboard id="grid"  label="A · GRID — by-the-book brutalist editorial" width={960} height={600}>
            <VariantGrid tweaks={tweaks} />
          </DCArtboard>
          <DCArtboard id="stamp" label="B · STAMP — zine collage with tape & stamps" width={960} height={600}>
            <VariantStamp tweaks={tweaks} />
          </DCArtboard>
          <DCArtboard id="tape"  label="C · TAPE — terminal / kinetic / mono-only" width={960} height={600}>
            <VariantTape tweaks={tweaks} />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <window.TweaksPanel title="Tweaks" defaultPos={{ right: 18, bottom: 18 }}>
        <window.TweakSection title="Motion">
          <window.TweakSlider
            label="Speed"
            value={tweaks.speed}
            min={0.3} max={3} step={0.1}
            onChange={(v) => setTweak('speed', v)}
            format={(v) => `${v.toFixed(1)}×`}
          />
          <window.TweakSelect
            label="Easing"
            value={tweaks.easing}
            options={[
              { value: 'linear', label: 'Linear' },
              { value: 'ease-out', label: 'Ease out' },
              { value: 'ease-in-out', label: 'Ease in-out' },
              { value: 'spring', label: 'Spring' },
              { value: 'snap', label: 'Snap (hard)' },
            ]}
            onChange={(v) => setTweak('easing', v)}
          />
          <window.TweakToggle
            label="Snap to slide"
            value={tweaks.snap}
            onChange={(v) => setTweak('snap', v)}
          />
        </window.TweakSection>
        <div style={{ fontSize: 11, opacity: 0.65, padding: '4px 2px 0', lineHeight: 1.5 }}>
          Tweaks apply to all 3 variants simultaneously so you can A/B them. Click an artboard's expand button to focus it fullscreen.
        </div>
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SpinRibApp />);
