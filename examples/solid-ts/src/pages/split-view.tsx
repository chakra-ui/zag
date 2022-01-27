import { injectGlobal } from "@emotion/css"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import * as SplitView from "@ui-machines/split-view"
import { createMemo, createUniqueId } from "solid-js"
import { splitViewStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(splitViewStyle)

export default function Page() {
  const [state, send] = useMachine(SplitView.machine.withContext({ min: 0 }))

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const splitter = createMemo(() => SplitView.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <>
      <div className="root">
        <div ref={ref} {...splitter().rootProps}>
          <div className="pane" {...splitter().primaryPaneProps}>
            <div>
              <small {...splitter().labelProps}>Table of Contents</small>
              <p>Primary Pane</p>
            </div>
          </div>
          <div className="splitter" {...splitter().splitterProps}>
            <div className="splitter-bar" />
          </div>
          <div className="pane" {...splitter().secondaryPaneProps}>
            Secondary Pane
          </div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
