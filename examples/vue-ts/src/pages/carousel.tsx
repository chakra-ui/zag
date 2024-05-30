import * as carousel from "@zag-js/carousel"
import { carouselControls, carouselData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "carousel",
  setup() {
    const controls = useControls(carouselControls)

    const [state, send] = useMachine(carousel.machine({ id: "1", index: 1 }), {
      context: controls.context,
    })

    const apiRef = computed(() => carousel.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="carousel">
            <div {...api.getRootProps()}>
              <button {...api.getPrevTriggerProps()}>Prev</button>
              <button {...api.getNextTriggerProps()}>Next</button>
              <div {...api.getViewportProps()}>
                <div {...api.getItemGroupProps()}>
                  {carouselData.map((image, index) => (
                    <div {...api.getItemProps({ index })} key={index}>
                      <img src={image} alt="" style={{ height: "300px", width: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </div>
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
