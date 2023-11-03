import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { collapsibleControls, collapsibleData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "collapsible",
  setup() {
    const controls = useControls(collapsibleControls)

    const [state, send] = useMachine(collapsible.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => collapsible.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="collapsible">
            <div {...api.rootProps}></div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
