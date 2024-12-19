import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/react"
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
      spacing: "20px",
      slidesPerPage: 2,
      slideCount: carouselData.length,
      allowMouseDrag: true,
    }),
    {
      context: controls.context,
    },
  )

  const api = carousel.connect(state, send, normalizeProps)

  return (
    <>
      <main className="carousel">
        <div {...api.getRootProps()}>
          <button onClick={() => api.scrollToIndex(4)}>Scroll to 4</button>
          <div {...api.getControlProps()}>
            <button {...api.getAutoplayTriggerProps()}>{api.isPlaying ? "Stop" : "Play"}</button>
            <div className="carousel-spacer" />
            <button {...api.getPrevTriggerProps()}>Prev</button>
            <button {...api.getNextTriggerProps()}>Next</button>
          </div>

          <div {...api.getItemGroupProps()}>
            {carouselData.map((image, index) => (
              <div {...api.getItemProps({ index })} key={index}>
                <img src={image} alt="" width="188px" />
              </div>
            ))}
          </div>
          <div {...api.getIndicatorGroupProps()}>
            {api.pageSnapPoints.map((_, index) => (
              <button {...api.getIndicatorProps({ index })} key={index} />
            ))}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["translations"]} />
      </Toolbar>
    </>
  )
}
