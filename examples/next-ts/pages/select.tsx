import * as select from "@zag-js/select"
import { useMachine, normalizeProps } from "@zag-js/react"
import { selectControls, selectData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(selectControls)

  const [state, send] = useMachine(select.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = select.connect(state, send, normalizeProps)

  return (
    <>
      <main className="select">
        <div {...api.rootProps}></div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
