import { normalizeProps, useMachine } from "@zag-js/preact"
import * as scrollArea from "@zag-js/scroll-area"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/scroll-area.css"

export default function Page() {
  const [count, setCount] = useState(3)
  const service = useMachine(scrollArea.machine, { id: useId() })
  const api = scrollArea.connect(service, normalizeProps)

  return (
    <>
      <main className="scroll-area">
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setCount(40)}>Add rows</button>
          <button onClick={() => setCount(3)}>Remove rows</button>
          <button onClick={() => api.scrollToEdge({ edge: "bottom" })}>Scroll to bottom</button>
        </div>
        <div {...api.getRootProps()}>
          <div {...api.getViewportProps()}>
            <div {...api.getContentProps()}>
              {Array.from({ length: count }, (_, index) => (
                <div key={index}>Row {index + 1}</div>
              ))}
            </div>
          </div>
          {api.hasOverflowY && (
            <div {...api.getScrollbarProps({ orientation: "vertical" })}>
              <div {...api.getThumbProps({ orientation: "vertical" })} />
            </div>
          )}
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
