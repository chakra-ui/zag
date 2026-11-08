"use client"

import { trackDismissableElement } from "@zag-js/dismissable"
import { useEffect, useRef, useState } from "react"
import "@styles/dismissable.css"

const peers = () => Array.from(document.querySelectorAll<HTMLElement>("[data-peer]"))

function PeerPanel(props: { id: string; label: string; children: React.ReactNode }) {
  const { id, label, children } = props
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    return trackDismissableElement(panelRef.current, {
      group: "toolbar-panels",
      exclude: peers,
      onLayerChange: () => {},
      onDismiss: () => setOpen(false),
    })
  }, [open])

  return (
    <div>
      <button data-peer data-testid={`trigger-${id}`} onClick={() => setOpen((value) => !value)}>
        {label}
      </button>
      <div
        ref={panelRef}
        data-peer
        hidden={!open}
        role="dialog"
        aria-label={label}
        data-testid={`panel-${id}`}
        className="panel"
      >
        {children}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <main className="group">
      <div className="row">
        <PeerPanel id="a" label="Notifications">
          <p>2 new comments on your pull request.</p>
        </PeerPanel>
        <PeerPanel id="b" label="Account">
          <p>Signed in as ama@example.com.</p>
        </PeerPanel>
      </div>
      <p data-testid="outside">Open both panels, then press Escape twice. The last one opened closes first.</p>
    </main>
  )
}
