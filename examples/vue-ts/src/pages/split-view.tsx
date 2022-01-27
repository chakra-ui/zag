import { injectGlobal } from "@emotion/css"
import * as SplitView from "@ui-machines/split-view"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { splitViewStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(splitViewStyle)

export default defineComponent({
  name: "SplitView",
  setup() {
    const [state, send] = useMachine(SplitView.machine.withContext({ min: 0 }))

    const ref = useSetup({ send, id: "1" })

    const splitter = computed(() => SplitView.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { rootProps, primaryPaneProps, labelProps, splitterProps, secondaryPaneProps } = splitter.value
      return (
        <div>
          <div class="root">
            <div ref={ref} {...rootProps}>
              <div class="pane" {...primaryPaneProps}>
                <div>
                  <small {...labelProps}>Table of Contents</small>
                  <p>Primary Pane</p>
                </div>
              </div>
              <div class="splitter" {...splitterProps}>
                <div class="splitter-bar" />
              </div>
              <div class="pane" {...secondaryPaneProps}>
                Secondary Pane
              </div>
            </div>
          </div>

          <StateVisualizer state={state} />
        </div>
      )
    }
  },
})
