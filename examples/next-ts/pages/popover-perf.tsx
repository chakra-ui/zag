import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Presence } from "../components/presence"

// Generate lots of items to make the popover content heavy
const items = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  title: `Item ${i + 1}`,
  description: `This is a detailed description for item ${i + 1} that adds more DOM nodes and content weight.`,
}))

// Generate tall page content to enable scrolling
const pageContent = Array.from({ length: 50 }, (_, i) => `Section ${i + 1}`)

export default function Page() {
  const service = useMachine(popover.machine, {
    id: useId(),
    positioning: { placement: "right-start", sizeMiddleware: false },
  })

  const api = popover.connect(service, normalizeProps)

  return (
    <main style={{ padding: 40 }}>
      <h1>Popover Performance Test</h1>
      <p style={{ marginBottom: 16, color: "#666" }}>
        Open the popover, then scroll the page. Watch for sluggish position updates in DevTools Performance tab.
      </p>

      <div
        style={{
          position: "sticky",
          top: 0,
          background: "white",
          padding: "12px 0",
          zIndex: 10,
          borderBottom: "1px solid #eee",
        }}
      >
        <button {...api.getTriggerProps()} style={{ padding: "8px 16px", fontSize: 16 }}>
          Open heavy popover
        </button>

        <Portal>
          <div {...api.getPositionerProps()}>
            <Presence
              {...api.getContentProps()}
              style={{
                background: "white",
                border: "1px solid #ccc",
                borderRadius: 8,
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                width: 380,
                maxHeight: 500,
                overflow: "auto",
                padding: 16,
              }}
            >
              <div {...api.getArrowProps()}>
                <div {...api.getArrowTipProps()} />
              </div>

              <h2 style={{ margin: "0 0 12px" }}>Heavy Popover Content</h2>

              {/* Lots of nested DOM nodes to make style recalc expensive */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 10,
                      border: "1px solid #eee",
                      borderRadius: 4,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <strong>{item.title}</strong>
                    <span style={{ fontSize: 13, color: "#666" }}>{item.description}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 6px",
                          background: "#f0f0f0",
                          borderRadius: 3,
                        }}
                      >
                        tag-a
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 6px",
                          background: "#f0f0f0",
                          borderRadius: 3,
                        }}
                      >
                        tag-b
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                {...api.getCloseTriggerProps()}
                style={{
                  marginTop: 12,
                  padding: "6px 12px",
                  position: "sticky",
                  bottom: 0,
                  background: "white",
                }}
              >
                Close
              </button>
            </Presence>
          </div>
        </Portal>
      </div>

      {/* Tall content to enable page scrolling */}
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 24 }}>
        {pageContent.map((section, i) => (
          <div key={i} style={{ padding: 24, background: "#f8f8f8", borderRadius: 8 }}>
            <h3>{section}</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
