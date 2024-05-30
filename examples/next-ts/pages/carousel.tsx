import * as carousel from "@zag-js/carousel"
import { useMachine, normalizeProps } from "@zag-js/react"
import { carouselControls, carouselData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(carouselControls)

  const [state, send] = useMachine(
    carousel.machine({
      id: useId(),
      index: 0,
      spacing: "20px",
      slidesPerView: 2,
    }),
    {
      // context: controls.context,
    },
  )

  const api = carousel.connect(state, send, normalizeProps)

  return (
    <>
      <main className="carousel">
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

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
