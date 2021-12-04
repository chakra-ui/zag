import { popover } from "@ui-machines/popover"
import { useMachine, normalizeProps, VuePropTypes } from "@ui-machines/vue"

import { computed, h, Fragment } from "vue"
import { defineComponent } from "@vue/runtime-core"
import { css } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { popoverStyle } from "../../../../shared/style"

const styles = css(popoverStyle)

export default defineComponent({
  name: "Popover",
  setup() {
    const [state, send] = useMachine(
      popover.machine.withContext({
        autoFocus: true,
      }),
    )

    const ref = useMount(send)

    const machineState = computed(() => popover.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      return (
        <div class={styles}>
          <div style={{ width: "300px" }} ref={ref}>
            <button {...machineState.value.triggerProps}>Click me</button>
            <div {...machineState.value.contentProps}>
              <div>Popover content</div>
              <div>
                <input placeholder="hello" />
              </div>
            </div>
          </div>

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
