import * as toggle from "@zag-js/toggle-group"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "ToggleGroup",
  setup() {
    const controls = useControls(toggleGroupControls)

    const [state, send] = useMachine(toggle.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => toggle.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="toggle-group">
            <button>Outside</button>
            <div {...api.rootProps}>
              {toggleGroupData.map((item) => (
                <button key={item.value} {...api.getToggleProps({ value: item.value })}>
                  {item.label}
                </button>
              ))}
            </div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
