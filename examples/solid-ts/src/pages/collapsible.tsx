import * as collapsible from "@zag-js/collapsible"
import { collapsibleControls, collapsibleData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(collapsibleControls)

  const [state, send] = useMachine(collapsible.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => collapsible.connect(state, send, normalizeProps))

  return (
    <>
      <main class="collapsible">
        <div {...api().rootProps}>
          <div>
            <span>{collapsibleData.headline}</span>
            <button {...api().triggerProps}>{api().isOpen ? "Collapse" : "Expand"}</button>
          </div>

          <div>
            <span>{collapsibleData.visibleItem}</span>
          </div>

          <div {...api().contentProps}>
            <Index each={collapsibleData.items}>{(item) => <div>{item()}</div>}</Index>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
