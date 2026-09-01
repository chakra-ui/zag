"use client"

import { getInteractionModality, trackFocusVisible, type Modality } from "@zag-js/focus-visible"
import { useEffect, useState } from "react"

export default function Page() {
  const [modality, setModality] = useState<Modality | null>(null)
  const [focusVisible, setFocusVisible] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setModality(getInteractionModality())
    return trackFocusVisible({
      onChange(details) {
        setFocusVisible(details.isFocusVisible)
        setModality(details.modality)
      },
    })
  }, [])

  const showRing = focusVisible && focused
  const verdict = !focused ? "click the button first" : showRing ? "FAIL — stray ring" : "PASS — no ring"

  return (
    <main style={{ fontFamily: "ui-sans-serif, system-ui", padding: 32, maxWidth: 640, lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Safari tab-return focus ring</h1>
      <p style={{ margin: "0 0 20px", color: "#444" }}>
        Click the button with the mouse or trackpad. Switch to another Safari tab, then come back. A pointer click must
        not leave a keyboard ring.
      </p>

      <button
        type="button"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontSize: 18,
          padding: "12px 20px",
          border: "2px solid #111",
          borderRadius: 8,
          background: showRing ? "#ffb3b3" : "#f4f4f4",
          outline: showRing ? "4px solid crimson" : "none",
          outlineOffset: 4,
        }}
      >
        Click me, then switch tabs
      </button>

      <dl
        style={{
          marginTop: 24,
          padding: 16,
          background: "#f6f6f6",
          borderRadius: 8,
          display: "grid",
          gridTemplateColumns: "max-content 1fr",
          gap: "6px 16px",
        }}
      >
        <dt>modality</dt>
        <dd style={{ margin: 0 }}>{modality ?? "null"}</dd>
        <dt>focus-visible</dt>
        <dd style={{ margin: 0 }}>{String(focusVisible)}</dd>
        <dt>button focused</dt>
        <dd style={{ margin: 0 }}>{String(focused)}</dd>
        <dt>ring</dt>
        <dd style={{ margin: 0, fontWeight: 700, color: showRing ? "crimson" : "seagreen" }}>{verdict}</dd>
      </dl>
    </main>
  )
}
