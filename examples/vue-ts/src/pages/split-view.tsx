import { css } from "@emotion/css"
import * as SplitView from "@ui-machines/split-view"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h } from "vue"
import { splitViewStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

const styles = css(splitViewStyle)

export default defineComponent({
  name: "SplitView",
  setup() {
    const [state, send] = useMachine(SplitView.machine.withContext({ min: 0 }))

    const ref = useMount(send)

    const splitterRef = computed(() => SplitView.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { rootProps, primaryPaneProps, labelProps, splitterProps, secondaryPaneProps } = splitterRef.value
      return (
        <div class={styles}>
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

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
