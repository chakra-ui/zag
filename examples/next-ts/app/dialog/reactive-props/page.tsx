"use client"

import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useEffect, useId, useState } from "react"
import "@styles/dialog.css"

// A remount resets this to 0, so a steady count proves the dialog was never torn down.
function Uptime() {
  const [ticks, setTicks] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTicks((n) => n + 1), 100)
    return () => clearInterval(id)
  }, [])

  return (
    <p data-testid="uptime">
      content uptime: <b data-testid="ticks">{ticks}</b> ticks
    </p>
  )
}

export default function Page() {
  const [modal, setModal] = useState(false)
  const [trapFocus, setTrapFocus] = useState(true)
  const [preventScroll, setPreventScroll] = useState(true)

  const service = useMachine(dialog.machine, {
    id: useId(),
    defaultOpen: true,
    modal,
    trapFocus,
    preventScroll,
  })

  const api = dialog.connect(service, normalizeProps)

  const minimized = !trapFocus && !preventScroll
  const toggleMinimized = () => {
    setTrapFocus(minimized)
    setPreventScroll(minimized)
  }

  return (
    <main className="dialog">
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button data-testid="toggle-minimized" onClick={toggleMinimized}>
          {minimized ? "Maximize" : "Minimize"}
        </button>
        <button data-testid="toggle-trap" onClick={() => setTrapFocus((v) => !v)}>
          trapFocus: {String(trapFocus)}
        </button>
        <button data-testid="toggle-scroll" onClick={() => setPreventScroll((v) => !v)}>
          preventScroll: {String(preventScroll)}
        </button>
        <button data-testid="toggle-modal" onClick={() => setModal((v) => !v)}>
          modal: {String(modal)}
        </button>
        <button {...api.getTriggerProps()} data-testid="trigger">
          Open dialog
        </button>
      </div>

      <button data-testid="outside-button" style={{ marginTop: "16px" }}>
        Outside button (should be reachable by Tab only when trapFocus is off)
      </button>

      <div style={{ height: "150vh", paddingTop: "16px" }}>Long page, so body scroll lock is observable.</div>

      {api.open && (
        <Portal>
          {/* kept mounted: <Portal> gives each child its own createPortal, so a backdrop
              rendered later lands after the positioner and covers the content */}
          <div {...api.getBackdropProps()} style={{ display: modal ? undefined : "none" }} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()} data-testid="content">
              <h2 {...api.getTitleProps()}>Player</h2>
              <p {...api.getDescriptionProps()}>Minimizing releases focus and scroll without closing or remounting.</p>
              <Uptime />
              <input data-testid="inside-input" placeholder="Inside the dialog..." />
              <button data-testid="inside-toggle-minimized" onClick={toggleMinimized}>
                {minimized ? "Maximize" : "Minimize"}
              </button>
              <button {...api.getCloseTriggerProps()} data-testid="close">
                Close
              </button>
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
