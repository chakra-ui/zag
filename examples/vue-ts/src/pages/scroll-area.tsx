import * as scroll-area from "@zag-js/scroll-area"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { scroll-areaControls, scroll-areaData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "scroll-area",
  setup() {
    const controls = useControls(scroll-areaControls)

    const [state, send] = useMachine(scroll-area.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => scroll-area.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="scroll-area">
            <div {...api.rootProps}>
            
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
