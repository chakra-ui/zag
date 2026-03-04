import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"

const items = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  title: `Item ${i + 1}`,
  description: `This is a detailed description for item ${i + 1} that adds more DOM nodes and content weight.`,
}))

const sections = Array.from({ length: 50 }, (_, i) => `Section ${i + 1}`)

export default function Page() {
  const service = useMachine(popover.machine, {
    id: createUniqueId(),
    positioning: { placement: "right-start", sizeMiddleware: false },
  })

  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <main style={{ padding: "40px" }}>
      <h1>Popover Performance Test</h1>
      <p style={{ "margin-bottom": "16px", color: "#666" }}>
        Open the popover, then scroll the page. Watch for sluggish position updates in DevTools Performance tab.
      </p>

      <div
        style={{
          position: "sticky",
          top: "0",
          background: "white",
          padding: "12px 0",
          "z-index": "10",
          "border-bottom": "1px solid #eee",
        }}
      >
        <button {...api().getTriggerProps()} style={{ padding: "8px 16px", "font-size": "16px" }}>
          Open heavy popover
        </button>

        <Portal>
          <div {...api().getPositionerProps()}>
            <Presence {...api().getContentProps()} style={{ "max-height": "500px", "overflow-block": "auto" }}>
              <div {...api().getArrowProps()}>
                <div {...api().getArrowTipProps()} />
              </div>

              <h2 style={{ margin: "0 0 12px" }}>Heavy Popover Content</h2>

              <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
                <For each={items}>
                  {(item) => (
                    <div
                      style={{
                        padding: "10px",
                        border: "1px solid #eee",
                        "border-radius": "4px",
                        display: "flex",
                        "flex-direction": "column",
                        gap: "4px",
                      }}
                    >
                      <strong>{item.title}</strong>
                      <span style={{ "font-size": "13px", color: "#666" }}>{item.description}</span>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <span
                          style={{
                            "font-size": "11px",
                            padding: "2px 6px",
                            background: "#f0f0f0",
                            "border-radius": "3px",
                          }}
                        >
                          tag-a
                        </span>
                        <span
                          style={{
                            "font-size": "11px",
                            padding: "2px 6px",
                            background: "#f0f0f0",
                            "border-radius": "3px",
                          }}
                        >
                          tag-b
                        </span>
                      </div>
                    </div>
                  )}
                </For>
              </div>

              <button
                {...api().getCloseTriggerProps()}
                style={{
                  "margin-top": "12px",
                  padding: "6px 12px",
                  position: "sticky",
                  bottom: "0",
                  background: "white",
                }}
              >
                Close
              </button>
            </Presence>
          </div>
        </Portal>
      </div>

      <div style={{ "margin-top": "40px", display: "flex", "flex-direction": "column", gap: "24px" }}>
        <For each={sections}>
          {(section) => (
            <div style={{ padding: "24px", background: "#f8f8f8", "border-radius": "8px" }}>
              <h3>{section}</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>
          )}
        </For>
      </div>
    </main>
  )
}
