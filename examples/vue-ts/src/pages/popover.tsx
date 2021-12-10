import { css } from "@emotion/css"
import * as Popover from "@ui-machines/popover"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { popoverStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

const styles = css(popoverStyle)

export default defineComponent({
  name: "Popover",
  setup() {
    const [state, send] = useMachine(
      Popover.machine.withContext({
        autoFocus: true,
      }),
    )

    const ref = useMount(send)

    const popoverRef = computed(() => Popover.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { triggerProps, contentProps } = popoverRef.value
      return (
        <div class={styles}>
          <div style={{ width: "300px" }} ref={ref}>
            <button {...triggerProps}>Click me</button>
            <div {...contentProps}>
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
