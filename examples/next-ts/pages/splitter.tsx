import { normalizeProps, useMachine } from "@zag-js/react"
import { splitterControls } from "@zag-js/shared"
import * as splitter from "@zag-js/splitter"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(splitterControls)

  const service = useMachine(splitter.machine, {
    id: useId(),
    defaultSize: [
      { id: "a", size: 50 },
      { id: "b", size: 50 },
    ],
  })

  const api = splitter.connect(service, normalizeProps)

  return (
    <>
      <main className="splitter">
        <div {...api.getRootProps()}>
          <div {...api.getPanelProps({ id: "a" })}>
            <p>A</p>
          </div>
          <div {...api.getResizeTriggerProps({ id: "a:b" })} />
          <div {...api.getPanelProps({ id: "b" })}>
            <p>B</p>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} omit={["previousPanels", "initialSize"]} />
      </Toolbar>
    </>
  )
}
