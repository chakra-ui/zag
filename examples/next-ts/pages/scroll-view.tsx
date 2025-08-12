import { normalizeProps, useMachine } from "@zag-js/react"
import * as scrollView from "@zag-js/scroll-view"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const service = useMachine(scrollView.machine, {
    id: useId(),
  })

  const api = scrollView.connect(service, normalizeProps)

  return (
    <>
      <main className="scroll-view">
        <button onClick={() => api.scrollToEdge({ edge: "bottom" })}>Scroll to bottom</button>
        <div {...api.getRootProps()}>
          <div {...api.getViewportProps()}>
            <div {...api.getContentProps()}>
              {Array.from({ length: 100 }).map((_, index) => (
                <div key={index}>{index}</div>
              ))}
            </div>
          </div>
          {api.hasOverflowY && (
            <div {...api.getScrollbarProps()}>
              <div {...api.getThumbProps()} />
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
