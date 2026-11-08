import { trackDismissableElement } from "@zag-js/dismissable"
import type { JSX } from "@solidjs/web"
import { createSignal, createTrackedEffect } from "solid-js"
import "@styles/dismissable.css"

const peers = () => Array.from(document.querySelectorAll<HTMLElement>("[data-peer]"))

function PeerPanel(props: { id: string; label: string; open: boolean; onDismiss: () => void; children: JSX.Element }) {
  let panelRef: HTMLDivElement | undefined

  createTrackedEffect(() => {
    if (!props.open) return
    return trackDismissableElement(panelRef ?? null, {
      group: "toolbar-panels",
      exclude: peers,
      onLayerChange: () => {},
      onDismiss: () => props.onDismiss(),
    })
  })

  return (
    <div
      ref={panelRef}
      data-peer
      hidden={!props.open}
      role="dialog"
      aria-label={props.label}
      data-testid={`panel-${props.id}`}
      class="panel"
    >
      {props.children}
    </div>
  )
}

export default function Page() {
  const [notifications, setNotifications] = createSignal(false)
  const [details, setDetails] = createSignal(false)

  return (
    <main>
      <div class="group">
        <div class="columns">
          <div class="column">
            <button data-peer data-testid="trigger-a" onClick={() => setNotifications((value) => !value)}>
              Notifications
            </button>
            <PeerPanel id="a" label="Notifications" open={notifications()} onDismiss={() => setNotifications(false)}>
              <p>2 new comments on your pull request.</p>
              <button data-testid="open-details" onClick={() => setDetails(true)}>
                View details
              </button>
            </PeerPanel>
          </div>
          <div class="column">
            <PeerPanel id="b" label="Details" open={details()} onDismiss={() => setDetails(false)}>
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
