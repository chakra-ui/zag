import { normalizeProps, useMachine } from "@zag-js/react"
import { splitterControls } from "@zag-js/shared"
import * as splitter from "@zag-js/splitter"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(splitterControls)

  const [state, send] = useMachine(
    splitter.machine({
      id: useId(),
      size: [{ id: "aside", size: 40, maxSize: 60 }, { id: "content", size: 20 }, { id: "sources" }],
    }),
    {
      context: controls.context,
    },
  )

  const api = splitter.connect(state, send, normalizeProps)

  return (
    <>
      <main className="splitter">
        <div {...api.rootProps}>
          <div {...api.getPanelProps({ id: "aside" })}>
            <p>Aside</p>
          </div>
          <div {...api.getResizeTriggerProps({ id: "aside:content" })}>
            <div className="bar" />
          </div>
          <div {...api.getPanelProps({ id: "content" })}>
            <p>Content</p>
          </div>
          <div {...api.getResizeTriggerProps({ id: "content:sources" })}>
            <div className="bar" />
          </div>
          <div {...api.getPanelProps({ id: "sources" })}>
            <p>Sources</p>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["previousPanels", "initialSize"]} />
      </Toolbar>
    </>
  )
}
