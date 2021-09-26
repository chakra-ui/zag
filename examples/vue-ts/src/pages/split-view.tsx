import { splitView } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"

import { computed, h, Fragment } from "vue"
import { defineComponent } from "@vue/runtime-core"
import { css } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { splitViewStyle } from "../../../../shared/style"

const styles = css(splitViewStyle)

export default defineComponent({
  name: "SplitView",
  setup() {
    const [state, send] = useMachine(splitView.machine.withContext({ min: 0 }))

    const ref = useMount(send)

    const machineState = computed(() => splitView.connect(state.value, send, normalizeProps))

    return () => (
      <div className={styles}>
        <div className="root">
          <div ref={ref} {...machineState.value.rootProps}>
            <div className="pane" {...machineState.value.primaryPaneProps}>
              <div>
                <small {...machineState.value.labelProps}>Table of Contents</small>
                <p>Primary Pane</p>
              </div>
            </div>
            <div className="splitter" {...machineState.value.splitterProps}>
              <div className="splitter-bar" />
            </div>
            <div className="pane" {...machineState.value.secondaryPaneProps}>
              Secondary Pane
            </div>
          </div>
        </div>

        <StateVisualizer state={state.value} />
      </div>
    )
  },
})
