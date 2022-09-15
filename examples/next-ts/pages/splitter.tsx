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
      max: [400],
      values: [200, 200],
      onChangeStart(details) {
        console.log("details :>> ", details)
      },
    }),
    {
      context: controls.context,
    },
  )
  const api = splitter.connect(state, send, normalizeProps)

  const [state2, send2] = useMachine(
    splitter.machine({
      id: useId(),
      orientation: "vertical",
      onChangeStart(details) {
        console.log("details :>> ", details)
      },
    }),
  )

  const nested = splitter.connect(state2, send2, normalizeProps)

  return (
    <>
      <main className="splitter">
        <div {...api.rootProps}>
          <div {...api.getPaneProps({ index: 0 })}>First Pane</div>
          <div {...api.getSeparatorProps({ index: 0 })}>
            <div className="splitter-bar" />
          </div>
          <div {...api.getPaneProps({ index: 1 })}>Second Pane</div>
          <div {...api.getSeparatorProps({ index: 1 })}>
            <div className="splitter-bar" />
          </div>
          <div {...api.getPaneProps({ index: 2 })}>
            <div {...nested.rootProps}>
              <div {...nested.getPaneProps({ index: 0 })}>Third Pane</div>
              <div {...nested.getSeparatorProps({ index: 0 })} />
              <div {...nested.getPaneProps({ index: 1 })}>Fourth Pane</div>
            </div>
          </div>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
