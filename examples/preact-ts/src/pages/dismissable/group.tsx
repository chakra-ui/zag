import { trackDismissableElement } from "@zag-js/dismissable"
import { useLayoutEffect, useRef, useState } from "preact/hooks"
import type { ComponentChildren } from "preact"
import "@styles/dismissable.css"

const peers = () => Array.from(document.querySelectorAll<HTMLElement>("[data-peer]"))

function PeerPanel(props: {
  id: string
  label: string
  open: boolean
  onDismiss: () => void
  children: ComponentChildren
}) {
  const { id, label, open, onDismiss, children } = props
  const panelRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open) return
    return trackDismissableElement(panelRef.current, {
      group: "toolbar-panels",
      exclude: peers,
      onLayerChange: () => {},
      onDismiss,
    })
  }, [open])

  return (
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
  )
}

export default function Page() {
  const [notifications, setNotifications] = useState(false)
  const [details, setDetails] = useState(false)

  return (
    <main>
      <div className="group">
        <div className="columns">
          <div className="column">
            <button data-peer data-testid="trigger-a" onClick={() => setNotifications((value) => !value)}>
              Notifications
            </button>
            <PeerPanel id="a" label="Notifications" open={notifications} onDismiss={() => setNotifications(false)}>
              <p>2 new comments on your pull request.</p>
              <button data-testid="open-details" onClick={() => setDetails(true)}>
                View details
              </button>
            </PeerPanel>
          </div>
          <div className="column">
            <PeerPanel id="b" label="Details" open={details} onDismiss={() => setDetails(false)}>
              <p>Ama commented on Fix select positioning.</p>
            </PeerPanel>
          </div>
        </div>
        <p data-testid="outside">
          Open Notifications, choose View details, then close Notifications to see Details stay open.
        </p>
      </div>
    </main>
  )
}
