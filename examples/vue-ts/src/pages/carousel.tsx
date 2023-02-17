import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { carouselControls, carouselData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "carousel",
  setup() {
    const controls = useControls(carouselControls)

    const [state, send] = useMachine(carousel.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => carousel.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="carousel">
            <div {...api.rootProps}></div>
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})
