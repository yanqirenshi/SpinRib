// SpinRib 2D — host app: design canvas + 6 variations + tweaks panel
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "miniSize": "md",
  "transition": "slide",
  "chrome": "arrows"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  return (
    <>
      <DesignCanvas>
        <DCSection
          id="hero"
          title="SpinRib · 2D"
          subtitle="Two-dimensional grid slider · arrow keys, click arrows, mini-map jump"
        >
          <DCArtboard id="play" label="A · Live demo (uses Tweaks)" width={1280} height={720}>
            <window.GridSlider2D
              theme={tweaks.theme}
              miniSize={tweaks.miniSize}
              transition={tweaks.transition}
              chrome={tweaks.chrome}
              label={`LIVE · ${tweaks.theme.toUpperCase()}`}
            />
          </DCArtboard>
          <DCArtboard id="light" label="B · Light mode — default" width={1280} height={720}>
            <window.GridSlider2D theme="light" miniSize="md" chrome="arrows" label="LIGHT" enableKeys={false} />
          </DCArtboard>
          <DCArtboard id="dark"  label="C · Dark mode — default" width={1280} height={720}>
            <window.GridSlider2D theme="dark" miniSize="md" chrome="arrows" label="DARK" enableKeys={false} />
          </DCArtboard>
        </DCSection>

        <DCSection id="minisize" title="Mini-map sizes" subtitle="Three densities — compact heads-up, medium balanced, large legible">
          <DCArtboard id="mini-sm" label="D · Mini-map · SM" width={1280} height={720}>
            <window.GridSlider2D theme="light" miniSize="sm" chrome="arrows" label="MINI · SM" enableKeys={false} />
          </DCArtboard>
          <DCArtboard id="mini-md" label="E · Mini-map · MD" width={1280} height={720}>
            <window.GridSlider2D theme="light" miniSize="md" chrome="arrows" label="MINI · MD" enableKeys={false} />
          </DCArtboard>
          <DCArtboard id="mini-lg" label="F · Mini-map · LG" width={1280} height={720}>
            <window.GridSlider2D theme="light" miniSize="lg" chrome="arrows" label="MINI · LG" enableKeys={false} />
          </DCArtboard>
        </DCSection>

        <DCSection id="chrome" title="Navigation chrome" subtitle="Arrows vs. keyboard hints — same slider, different affordances">
          <DCArtboard id="kbd-light" label="G · Keyboard hint cluster · light" width={1280} height={720}>
            <window.GridSlider2D theme="light" miniSize="md" chrome="keyboard" label="KEYBOARD" enableKeys={false} />
          </DCArtboard>
          <DCArtboard id="kbd-dark"  label="H · Keyboard hint cluster · dark" width={1280} height={720}>
            <window.GridSlider2D theme="dark" miniSize="md" chrome="keyboard" label="KEYBOARD" enableKeys={false} />
          </DCArtboard>
        </DCSection>

        <DCSection id="motion" title="Transition states" subtitle="Snapshots of the in-flight rib-traversal — frozen at t = 0%, 50%, 100%">
          <DCArtboard id="t0"   label="I · t = 0% (start)"  width={1280} height={720}>
            <window.GridSlider2D theme="light" miniSize="md" chrome="arrows" transition="slide"
              frozenAt={0} frozenFrom={{ y: 3, x: 0 }} label="t = 0%" enableKeys={false} />
          </DCArtboard>
          <DCArtboard id="t50"  label="J · t = 50% (mid)"   width={1280} height={720}>
            <window.GridSlider2D theme="light" miniSize="md" chrome="arrows" transition="slide"
              frozenAt={0.5} frozenFrom={{ y: 3, x: 0 }} label="t = 50%" enableKeys={false} />
          </DCArtboard>
          <DCArtboard id="t100" label="K · t = 100% (end)"  width={1280} height={720}>
            <window.GridSlider2D theme="light" miniSize="md" chrome="arrows" transition="slide"
              frozenAt={1} frozenFrom={{ y: 3, x: 0 }} label="t = 100%" enableKeys={false} />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Theme" />
        <window.TweakRadio
          label="Mode"
          value={tweaks.theme}
          options={['light', 'dark']}
          onChange={(v) => setTweak('theme', v)}
        />

        <window.TweakSection label="Mini-map" />
        <window.TweakRadio
          label="Size"
          value={tweaks.miniSize}
          options={['sm', 'md', 'lg']}
          onChange={(v) => setTweak('miniSize', v)}
        />

        <window.TweakSection label="Navigation" />
        <window.TweakSelect
          label="Chrome"
          value={tweaks.chrome}
          options={[
            { value: 'arrows', label: 'Arrows only' },
            { value: 'arrows-with-hints', label: 'Arrows + key labels' },
            { value: 'keyboard', label: 'Keyboard cluster' },
            { value: 'both', label: 'Arrows + keyboard' },
          ]}
          onChange={(v) => setTweak('chrome', v)}
        />

        <window.TweakSection label="Motion" />
        <window.TweakSelect
          label="Transition"
          value={tweaks.transition}
          options={[
            { value: 'slide', label: 'Slide' },
            { value: 'fade', label: 'Fade' },
            { value: 'cut', label: 'Cut (instant)' },
          ]}
          onChange={(v) => setTweak('transition', v)}
        />

        <div style={{ fontSize: 10.5, opacity: 0.65, padding: '6px 2px 0', lineHeight: 1.5, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em' }}>
          Tweaks apply to artboard A. Use ↑↓←→ on the keyboard to navigate when the page has focus. Click an artboard's expand button to focus fullscreen.
        </div>
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
