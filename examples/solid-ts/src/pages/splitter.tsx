import { injectGlobal } from "@emotion/css"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@zag-js/solid"
import * as splitter from "@zag-js/splitter"
import { createMemo, createUniqueId } from "solid-js"
import { splitterControls, splitterStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
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
      <main>
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
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
