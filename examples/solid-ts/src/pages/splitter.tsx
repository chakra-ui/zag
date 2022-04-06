import { injectGlobal } from "@emotion/css"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@zag-js/solid"
import * as splitter from "@zag-js/splitter"
import { createMemo, createUniqueId } from "solid-js"
import { splitterControls } from "../../../../shared/controls"
import { splitterStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(splitterStyle)

export default function Page() {
  const controls = useControls(splitterControls)

  const [state, send] = useMachine(splitter.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: createUniqueId() })

  const api = createMemo(() => splitter.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div>
        <div ref={ref} {...api().rootProps}>
          <div {...api().primaryPaneProps}>
            <div>
              <small {...api().labelProps}>Table of Contents</small>
              <p>Primary Pane</p>
            </div>
          </div>
          <div {...api().splitterProps}>
            <div className="splitter-bar" />
          </div>
          <div {...api().secondaryPaneProps}>Secondary Pane</div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
