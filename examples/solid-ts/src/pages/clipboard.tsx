import * as clipboard from "@zag-js/clipboard"
import { clipboardControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(clipboardControls)

  const [state, send] = useMachine(
    clipboard.machine({
      id: createUniqueId(),
      value: "Text to copy!",
    }),
    {
      context: controls.context,
    },
  )

  const api = createMemo(() => clipboard.connect(state, send, normalizeProps))

  return (
    <>
      <main class="clipboard">
        <div>
          <button {...api().triggerProps}>Copy Text</button>
          <div {...api().getIndicatorProps({ copied: true })}>Copied</div>
          <div {...api().getIndicatorProps({ copied: false })}>Copy</div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
