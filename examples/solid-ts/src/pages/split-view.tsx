import { splitView } from "@ui-machines/web"
import { normalizeProps, useMachine, useSetup, SolidPropTypes } from "@ui-machines/solid"

import { createMemo } from "solid-js"
import { css, CSSObject } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { splitViewStyle } from "../../../../shared/style"

const styles = css(splitViewStyle as CSSObject)

export default function Page() {
  const [state, send] = useMachine(splitView.machine.withContext({ min: 0 }))

  const ref = useSetup<HTMLDivElement>({ send, id: "123" })

  const machineState = createMemo(() => splitView.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div className={styles}>
      <div className="root">
        <div ref={ref} {...machineState().rootProps}>
          <div className="pane" {...machineState().primaryPaneProps}>
            <div>
              <small {...machineState().labelProps}>Table of Contents</small>
              <p>Primary Pane</p>
            </div>
          </div>
          <div className="splitter" {...machineState().splitterProps}>
            <div className="splitter-bar" />
          </div>
          <div className="pane" {...machineState().secondaryPaneProps}>
            Secondary Pane
          </div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
