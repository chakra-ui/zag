import { normalizeProps, useMachine } from "@zag-js/react"
import * as scrollArea from "@zag-js/scroll-area"
import { scrollAreaControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(scrollAreaControls)

  const service = useMachine(scrollArea.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = scrollArea.connect(service, normalizeProps)

  return (
    <>
      <main className="scroll-area">
        <button onClick={() => api.scrollToEdge({ edge: "bottom" })}>Scroll to bottom</button>
        <div {...api.getRootProps()}>
          <div {...api.getViewportProps()}>
            <div {...api.getContentProps()} style={{ minWidth: "800px" }}>
              {Array.from({ length: 100 }).map((_, index) => (
                <div key={index}>{index}</div>
              ))}
            </div>
          </div>
          {api.hasOverflowY && (
            <div {...api.getScrollbarProps({ orientation: "vertical" })}>
              <div {...api.getThumbProps({ orientation: "vertical" })} />
            </div>
          )}
          {api.hasOverflowX && (
            <div {...api.getScrollbarProps({ orientation: "horizontal" })}>
              <div {...api.getThumbProps({ orientation: "horizontal" })} />
            </div>
          )}
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
