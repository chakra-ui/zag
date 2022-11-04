import * as select from "@zag-js/select"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { selectControls, selectData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(selectControls)

  const [state, send] = useMachine(select.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => select.connect(state, send, normalizeProps))

  return (
    <>
      <main class="select">
        <div {...api().rootProps}></div>
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
