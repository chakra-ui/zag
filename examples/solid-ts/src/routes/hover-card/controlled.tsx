import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/hover-card.css"

export default function Page() {
  const [open, setOpen] = createSignal(false)
  const [log, setLog] = createSignal<string[]>([])

  const id = createUniqueId()
  const service = useMachine(hoverCard.machine, () => ({
    id,
    open: open(),
    onOpenChange: (details) => {
      setOpen(details.open)
      setLog((prev) => [...prev, `${details.open ? "open" : "close"}:${details.reason ?? "-"}`])
    },
  }))

  const api = createMemo(() => hoverCard.connect(service, normalizeProps))

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>HoverCard Controlled</h1>
      <h1>{String(open())}</h1>
      <div data-testid="reason-log">{log().join(" ")}</div>
      <button type="button" data-testid="clear-log" onClick={() => setLog([])}>
        Clear log
      </button>

      <div style={{ display: "flex", gap: "12px", "margin-bottom": "24px" }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <main class="hover-card">
        <div style={{ display: "flex", gap: "50px" }}>
          <a href="https://twitter.com/zag_js" target="_blank" {...api().getTriggerProps()}>
            Twitter
          </a>

          <Show when={api().open}>
            <Portal>
              <div {...api().getPositionerProps()}>
                <div {...api().getContentProps()}>
                  <div {...api().getArrowProps()}>
                    <div {...api().getArrowTipProps()} />
                  </div>
                  Twitter Preview
                  <a href="https://twitter.com/zag_js" target="_blank">
                    Twitter
                  </a>
                </div>
              </div>
            </Portal>
          </Show>
        </div>
      </main>
    </div>
  )
}
