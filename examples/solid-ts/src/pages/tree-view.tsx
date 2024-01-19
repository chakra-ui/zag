import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
// import { treeControls, treeData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
// import { useControls } from "../hooks/use-controls"

export default function Page() {
  // const controls = useControls(treeviewControls)

  const [state, send] = useMachine(tree.machine({ id: createUniqueId() }), {
    // context: controls.context,
  })

  const api = createMemo(() => tree.connect(state, send, normalizeProps))

  return (
    <>
      <main class="tree-view">
        <div {...api().rootProps}></div>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
