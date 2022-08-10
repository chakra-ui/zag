import { normalizeProps, useMachine } from "@zag-js/solid"
import * as splitter from "@zag-js/splitter"
import { createMemo, createUniqueId } from "solid-js"
import { splitterControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(splitterControls)

  const [state, send] = useMachine(splitter.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => splitter.connect(state, send, normalizeProps))

  return (
    <>
      <main class="splitter">
        <div>
          <div {...api().rootProps}>
            <div {...api().primaryPaneProps}>
              <div>
                <small {...api().labelProps}>Table of Contents</small>
                <p>Primary Pane</p>
              </div>
            </div>
            <div {...api().splitterProps}>
              <div class="splitter-bar" />
            </div>
            <div {...api().secondaryPaneProps}>Secondary Pane</div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
