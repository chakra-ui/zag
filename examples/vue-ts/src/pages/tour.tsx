import * as tour from "@zag-js/tour"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { tourControls, tourData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "tour",
  setup() {
    const controls = useControls(tourControls)

    const [state, send] = useMachine(tour.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => tour.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="tour">
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
