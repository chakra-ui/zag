import { injectGlobal } from "@emotion/css"
import { normalizeProps, VuePropTypes, useMachine, useSetup } from "@ui-machines/vue"
import * as Toggle from "@ui-machines/toggle"
import { defineComponent } from "@vue/runtime-core"
import { toggleStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { computed, h, Fragment } from "vue"

injectGlobal(toggleStyle)

export default defineComponent({
  name: "Toggle",
  setup() {
    const [state, send] = useMachine(Toggle.machine.withContext({ label: "Toggle italic" }))
    const ref = useSetup({ send, id: "12" })
    const toggle = computed(() => Toggle.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { buttonProps } = toggle.value
      return (
        <div ref={ref}>
          <button class="toggle" {...buttonProps}>
            B
          </button>
          <StateVisualizer state={state} />
        </div>
      )
    }
  },
})
