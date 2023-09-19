import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toggle from "@zag-js/toggle-group"
import { For, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(toggleGroupControls)

  const [state, send] = useMachine(toggle.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => toggle.connect(state, send, normalizeProps))

  return (
    <>
      <main class="toggle-group">
        <button>Outside</button>
        <div {...api().rootProps}>
          <For each={toggleGroupData}>
            {(item) => <button {...api().getItemProps({ value: item.value })}>{item.label}</button>}
          </For>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
