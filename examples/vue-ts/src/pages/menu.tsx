import { menu } from "@ui-machines/menu"
import { useMachine, normalizeProps, VuePropTypes } from "@ui-machines/vue"

import { defineComponent, h, Fragment, computed } from "vue"
import { css, CSSObject } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { menuStyle } from "../../../../shared/style"

const styles = css(menuStyle as CSSObject)

export default defineComponent({
  name: "Menu",
  setup() {
    const [state, send] = useMachine(
      menu.machine.withContext({
        uid: "123",
        onSelect: console.log,
      }),
    )

    const ref = useMount(send)

    const machineState = computed(() => menu.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      return (
        <div class={styles}>
          <button ref={ref} {...machineState.value.triggerProps}>
            Click me
          </button>
          <ul style={{ width: "300px" }} {...machineState.value.menuProps}>
            <li {...machineState.value.getItemProps({ id: "menuitem-1" })}>Edit</li>
            <li {...machineState.value.getItemProps({ id: "menuitem-2" })}>Duplicate</li>
            <li {...machineState.value.getItemProps({ id: "menuitem-3" })}>Delete</li>
          </ul>

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
