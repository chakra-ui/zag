import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { clipboardControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(clipboardControls)

  const [state, send] = useMachine(
    clipboard.machine({
      id: useId(),
      value: "Text to copy!",
    }),
    {
      context: controls.context,
    },
  )

  const api = clipboard.connect(state, send, normalizeProps)

  return (
    <>
      <main className="clipboard">
        <div>
          <button {...api.triggerProps}>Copy Text</button>
          <div {...api.getIndicatorProps({ copied: true })}>Copied</div>
          <div {...api.getIndicatorProps({ copied: false })}>Copy</div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
