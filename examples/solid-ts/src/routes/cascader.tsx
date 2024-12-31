import * as cascader from "@zag-js/cascader"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { cascaderControls, cascaderData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(cascaderControls)

  const [state, send] = useMachine(cascader.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => cascader.connect(state, send, normalizeProps))

  return (
    <>
      <main class="cascader">
        <div {...api().getRootProps()}></div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
