import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { navigationMenuControls, navigationMenuData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(navigationMenuControls)

  const [state, send] = useMachine(navigationMenu.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => navigationMenu.connect(state, send, normalizeProps))

  return (
    <>
      <main class="navigation-menu">
        <div {...api().getRootProps()}></div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
