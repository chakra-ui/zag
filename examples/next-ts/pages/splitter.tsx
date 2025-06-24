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
    panels: [{ id: "a" }, { id: "b" }, { id: "c" }],
    ...controls.context,
  })

  const api = splitter.connect(service, normalizeProps)

  return (
    <>
      <main className="splitter">
        <pre>{JSON.stringify(api.getSizes(), null, 2)}</pre>
        <div {...api.getRootProps()}>
          <div {...api.getPanelProps({ id: "a" })}>
            <p>Left</p>
          </div>
          <div data-testid="trigger-a:b" {...api.getResizeTriggerProps({ id: "a:b" })} />
          <div {...api.getPanelProps({ id: "b" })}>
            <p>Middle</p>
          </div>
          <div data-testid="trigger-b:c" {...api.getResizeTriggerProps({ id: "b:c" })} />
          <div {...api.getPanelProps({ id: "c" })}>
            <p>Right</p>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
