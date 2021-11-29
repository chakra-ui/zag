import { splitView } from "@ui-machines/split-view"
import { useMachine, normalizeProps, VuePropTypes } from "@ui-machines/vue"

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

    const machineState = computed(() => splitView.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => (
      <div class={styles}>
        <div class="root">
          <div ref={ref} {...machineState.value.rootProps}>
            <div class="pane" {...machineState.value.primaryPaneProps}>
              <div>
                <small {...machineState.value.labelProps}>Table of Contents</small>
                <p>Primary Pane</p>
              </div>
            </div>
            <div class="splitter" {...machineState.value.splitterProps}>
              <div class="splitter-bar" />
            </div>
            <div class="pane" {...machineState.value.secondaryPaneProps}>
              Secondary Pane
            </div>
          </div>
        </div>

        <StateVisualizer state={state.value} />
      </div>
    )
  },
})
