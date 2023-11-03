import * as collapsible from "@zag-js/collapsible"
import { useMachine, normalizeProps } from "@zag-js/react"
import { collapsibleControls, collapsibleData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(collapsibleControls)

  const [state, send] = useMachine(collapsible.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = collapsible.connect(state, send, normalizeProps)

  return (
    <>
      <main className="collapsible">
        <div {...api.rootProps}></div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
