import { createHotkeyStore } from "@zag-js/hotkeys"
import { createSignal, onCleanup, onMount } from "solid-js"

const store = createHotkeyStore()

const boxStyle = {
  border: "2px solid #999",
  "border-radius": "0.5rem",
  padding: "1rem",
  "margin-bottom": "1rem",
}

export default function HotkeyTargetsPage() {
  let gridRef: HTMLDivElement | undefined
  let hostRef: HTMLDivElement | undefined

  const [globalCount, setGlobalCount] = createSignal(0)
  const [scopedCount, setScopedCount] = createSignal(0)
  const [arrowCount, setArrowCount] = createSignal(0)
  const [shadowCount, setShadowCount] = createSignal(0)
  const [seqCount, setSeqCount] = createSignal(0)
  const [pressedKeys, setPressedKeys] = createSignal("")
  const [shiftSeen, setShiftSeen] = createSignal(false)

  onMount(() => {
    const host = hostRef!
    if (!host.shadowRoot) {
      const shadow = host.attachShadow({ mode: "open" })
      const btn = document.createElement("button")
      btn.textContent = "shadow button (focus me, then press ctrl+m)"
      btn.id = "shadow-btn"
      shadow.appendChild(btn)
    }

    store.register([
      { id: "global.k", hotkey: "ctrl+k", action: () => setGlobalCount((c) => c + 1) },
      {
        id: "scoped.k",
        hotkey: "ctrl+k",
        action: () => setScopedCount((c) => c + 1),
        options: { target: () => gridRef ?? null },
      },
      {
        id: "grid.down",
        hotkey: "ArrowDown",
        action: () => setArrowCount((c) => c + 1),
        options: { target: () => gridRef ?? null },
      },
      {
        id: "shadow.m",
        hotkey: "ctrl+m",
        action: () => setShadowCount((c) => c + 1),
        options: { target: () => hostRef ?? null },
      },
      { id: "seq.gh", hotkey: "g > h", action: () => setSeqCount((c) => c + 1) },
    ])

    const unsub = store.subscribe(
      (state) => [...state.pressedKeys].join("+"),
      (keys) => {
        if (keys) setPressedKeys(keys)
        if (store.isPressed("shift")) setShiftSeen(true)
      },
    )

    store.init({ target: document })

    onCleanup(() => {
      unsub()
      store.destroy()
    })
  })

  return (
    <main style={{ padding: "2rem", "max-width": "42rem", margin: "0 auto" }}>
      <h1 style={{ "font-size": "1.5rem", "font-weight": "bold", "margin-bottom": "1rem" }}>Hotkey Targets</h1>

      <button data-testid="outside">outside button</button>

      <div ref={gridRef} tabIndex={0} data-testid="grid" style={{ ...boxStyle, "margin-top": "1rem" }}>
        grid — focus me, then press <code>ctrl+k</code> or <code>ArrowDown</code>
      </div>

      <div ref={hostRef} data-testid="shadow-host" style={boxStyle} />

      <dl style={{ "font-family": "monospace" }}>
        <dt>global ctrl+k</dt>
        <dd data-testid="global-count">{globalCount()}</dd>
        <dt>scoped ctrl+k (grid)</dt>
        <dd data-testid="scoped-count">{scopedCount()}</dd>
        <dt>ArrowDown (grid)</dt>
        <dd data-testid="arrow-count">{arrowCount()}</dd>
        <dt>ctrl+m (shadow host)</dt>
        <dd data-testid="shadow-count">{shadowCount()}</dd>
        <dt>sequence g then h</dt>
        <dd data-testid="seq-count">{seqCount()}</dd>
        <dt>last pressed keys</dt>
        <dd data-testid="pressed-keys">{pressedKeys() || "-"}</dd>
        <dt>isPressed("shift") observed</dt>
        <dd data-testid="shift-seen">{String(shiftSeen())}</dd>
      </dl>
    </main>
  )
}
