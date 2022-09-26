import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { paginationControls, paginationStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(paginationControls)

  const [state, send] = useMachine(pagination.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => pagination.connect(state, send, normalizeProps))

  return (
    <>
      <main class="pagination">
        <div {...api().rootProps}></div>
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
