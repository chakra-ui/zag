import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { popover } from "@ui-machines/web"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { css } from "@emotion/css"

const styles = css({
  '[role="dialog"]': {
    background: "red",
    padding: "20px",
  },
  '[role="dialog"]:focus': {
    outline: "2px solid royalblue",
  },
})

export default defineComponent({
  name: "Popover",
  setup() {
    const [state, send] = useMachine(
      popover.machine.withContext({
        autoFocus: true,
      }),
    )

    const ref = useMount(send)
    const machineState = computed(() => popover.connect(state.value, send, normalizeProps))

    return () => {
      return (
        <div className={styles}>
          <div style={{ width: "300px" }} ref={ref}>
            <button {...machineState.value.triggerProps}>Click me</button>
            <div {...machineState.value.popoverProps}>
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
