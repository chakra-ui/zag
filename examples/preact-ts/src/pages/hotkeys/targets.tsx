import { createHotkeyStore } from "@zag-js/hotkeys"
import { useEffect, useRef, useState } from "react"

const store = createHotkeyStore()

const boxStyle: React.CSSProperties = {
  border: "2px solid #999",
  borderRadius: "0.5rem",
  padding: "1rem",
  marginBottom: "1rem",
}

export default function HotkeyTargetsPage() {
  const gridRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)

  const [globalCount, setGlobalCount] = useState(0)
  const [scopedCount, setScopedCount] = useState(0)
  const [arrowCount, setArrowCount] = useState(0)
  const [shadowCount, setShadowCount] = useState(0)
  const [seqCount, setSeqCount] = useState(0)
  const [pressedKeys, setPressedKeys] = useState("")
  const [shiftSeen, setShiftSeen] = useState(false)

  useEffect(() => {
    const host = hostRef.current!
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
        options: { target: () => gridRef.current },
      },
      {
        id: "grid.down",
        hotkey: "ArrowDown",
        action: () => setArrowCount((c) => c + 1),
        options: { target: () => gridRef.current },
      },
      {
        id: "shadow.m",
        hotkey: "ctrl+m",
        action: () => setShadowCount((c) => c + 1),
        options: { target: () => hostRef.current },
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

    return () => {
      unsub()
      store.destroy()
    }
  }, [])

  return (
    <main style={{ padding: "2rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Hotkey Targets</h1>

      <button data-testid="outside">outside button</button>

      <div ref={gridRef} tabIndex={0} data-testid="grid" style={{ ...boxStyle, marginTop: "1rem" }}>
        grid — focus me, then press <code>ctrl+k</code> or <code>ArrowDown</code>
      </div>

      <div ref={hostRef} data-testid="shadow-host" style={boxStyle} />

      <dl style={{ fontFamily: "monospace" }}>
        <dt>global ctrl+k</dt>
        <dd data-testid="global-count">{globalCount}</dd>
        <dt>scoped ctrl+k (grid)</dt>
        <dd data-testid="scoped-count">{scopedCount}</dd>
        <dt>ArrowDown (grid)</dt>
        <dd data-testid="arrow-count">{arrowCount}</dd>
        <dt>ctrl+m (shadow host)</dt>
        <dd data-testid="shadow-count">{shadowCount}</dd>
        <dt>sequence g then h</dt>
        <dd data-testid="seq-count">{seqCount}</dd>
        <dt>last pressed keys</dt>
        <dd data-testid="pressed-keys">{pressedKeys || "-"}</dd>
        <dt>isPressed(&quot;shift&quot;) observed</dt>
        <dd data-testid="shift-seen">{String(shiftSeen)}</dd>
      </dl>
    </main>
  )
}
