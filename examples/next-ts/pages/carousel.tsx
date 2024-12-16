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
      snapIndex: 0,
      spacing: "20px",
      slidesPerPage: 2,
      slideCount: carouselData.length,
      draggable: true,
      onSnapChange(details) {
        console.log("onSnapChange", details)
      },
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
          <div {...api.getControlProps()}>
            <button {...api.getPrevTriggerProps()}>Prev</button>
            <button {...api.getNextTriggerProps()}>Next</button>
            <button {...api.getAutoplayTriggerProps()}>{api.isPlaying ? "Stop" : "Play"}</button>
          </div>

          <div {...api.getItemGroupProps()}>
            {carouselData.map((image, index) => (
              <div {...api.getItemProps({ index })} key={index}>
                <img src={image} alt="" style={{ height: "300px", width: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
          <div {...api.getIndicatorGroupProps()}>
            {api.snapPoints.map((_, index) => (
              <button {...api.getIndicatorProps({ index })} key={index} />
            ))}
          </div>
        </div>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={state} omit={["translations"]} />
      </Toolbar>
    </>
  )
}
