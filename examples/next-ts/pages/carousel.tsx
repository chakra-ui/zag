import * as carousel from "@zag-js/carousel"
import { useMachine, normalizeProps } from "@zag-js/react"
import { carouselControls, carouselData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(carouselControls)

  const [state, send] = useMachine(carousel.machine({ id: useId(), index: 1 }), {
    context: controls.context,
  })

  const api = carousel.connect(state, send, normalizeProps)

  return (
    <>
      <main className="carousel">
        <div {...api.rootProps}>
          <button {...api.previousTriggerProps}>Prev</button>
          <button {...api.nextTriggerProps}>Next</button>
          <div {...api.viewportProps}>
            <div {...api.slideGroupProps}>
              {carouselData.map((image, index) => (
                <div {...api.getSlideProps({ index })} key={index}>
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
