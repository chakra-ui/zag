import { trackDismissableElement } from "@zag-js/dismissable"
import type { JSX } from "@solidjs/web"
import { createSignal, createTrackedEffect } from "solid-js"
import "@styles/dismissable.css"

const peers = () => Array.from(document.querySelectorAll<HTMLElement>("[data-peer]"))

function PeerPanel(props: { id: string; label: string; children: JSX.Element }) {
  const [open, setOpen] = createSignal(false)
  let panelRef: HTMLDivElement | undefined

  createTrackedEffect(() => {
    if (!open()) return
    return trackDismissableElement(panelRef ?? null, {
      group: "toolbar-panels",
      exclude: peers,
      onLayerChange: () => {},
      onDismiss: () => setOpen(false),
    })
  })

  return (
    <div>
      <button data-peer data-testid={`trigger-${props.id}`} onClick={() => setOpen((value) => !value)}>
        {props.label}
      </button>
      <div
        ref={panelRef}
        data-peer
        hidden={!open()}
        role="dialog"
        aria-label={props.label}
        data-testid={`panel-${props.id}`}
        class="panel"
      >
        {props.children}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <main class="group">
      <div class="row">
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
