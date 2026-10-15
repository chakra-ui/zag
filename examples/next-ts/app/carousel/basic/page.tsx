"use client"

import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { carouselControls, carouselData } from "@zag-js/shared"
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/carousel.css"

export default function Page() {
  const controls = useControls(carouselControls)

  const service = useMachine(carousel.machine, {
    id: useId(),
    spacing: "16px",
    slidesPerPage: 2,
    count: carouselData.length,
    allowMouseDrag: true,
    ...controls.context,
  })

  const api = carousel.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="carousel">
          <div {...api.getRootProps()}>
            <div className="carousel-toolbar">
              <button onClick={() => api.scrollToIndex(4)}>Scroll to 4</button>
            </div>

            <div {...api.getControlProps()}>
              <button {...api.getPrevTriggerProps()}>
                <ChevronLeftIcon />
              </button>
              <div {...api.getItemGroupProps()}>
                {carouselData.map((image, index) => (
                  <div {...api.getItemProps({ index })} key={index} className="carousel-photo">
                    <img src={image} alt="" />
                  </div>
                ))}
              </div>
              <button {...api.getNextTriggerProps()}>
                <ChevronRightIcon />
              </button>
            </div>

            <div className="carousel-footer">
              <button {...api.getAutoplayTriggerProps()}>
                {api.isPlaying ? <PauseIcon /> : <PlayIcon />}
                <span className="sr-only">{api.isPlaying ? "Stop" : "Play"}</span>
              </button>
              <div {...api.getIndicatorGroupProps()}>
                {api.pageSnapPoints.map((_, index) => (
                  <button {...api.getIndicatorProps({ index })} key={index} />
                ))}
              </div>
              <span {...api.getProgressTextProps()}>{api.getProgressText()}</span>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} omit={["translations"]} />
      </Toolbar>
    </>
  )
}
