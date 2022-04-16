import { injectGlobal } from "@emotion/css"
import * as splitter from "@zag-js/splitter"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { splitterControls } from "../../../../shared/controls"
import { splitterStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"
import { useId } from "../hooks/use-id"

injectGlobal(splitterStyle)

export default defineComponent({
  name: "Splitter",
  setup() {
    const controls = useControls(splitterControls)

    const [state, send] = useMachine(splitter.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: useId() })

    const apiRef = computed(() => splitter.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <controls.ui />

          <div ref={ref} {...api.rootProps}>
            <div {...api.primaryPaneProps}>
              <div>
                <small {...api.labelProps}>Table of Contents</small>
                <p>Primary Pane</p>
              </div>
            </div>
            <div {...api.splitterProps}>
              <div class="splitter-bar" />
            </div>
            <div {...api.secondaryPaneProps}>Secondary Pane</div>
          </div>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
