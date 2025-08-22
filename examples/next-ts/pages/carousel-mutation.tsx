import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useCallback, useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [index, setIndex] = useState(0)
  const [images, setImages] = useState([0, 1, 2, 3, 4])

  const service = useMachine(carousel.machine, {
    id: useId(),
    slideCount: images.length,
    loop: true,
    autoplay: { delay: 1000 },
    onPageChange: ({ page }) => setIndex(page),
    page: index,
  })

  const api = carousel.connect(service, normalizeProps)

  const onAdd = useCallback(
    () =>
      setImages((prevImages) => {
        const max = Math.max(...prevImages)
        return [...prevImages, max + 1]
      }),
    [],
  )

  return (
    <>
      <main className="carousel">
        <div {...api.getRootProps()}>
          <div {...api.getControlProps()}>
            <button {...api.getAutoplayTriggerProps()}>{api.isPlaying ? "Stop" : "Play"}</button>
            <div className="carousel-spacer" />
            <button {...api.getPrevTriggerProps()}>&laquo;</button>
            <button {...api.getNextTriggerProps()}>&raquo;</button>
          </div>

          <div {...api.getIndicatorGroupProps()}>
            {api.pageSnapPoints.map((_, i) => (
              <button {...api.getIndicatorProps({ index: i })} key={i}>
                {i}
              </button>
            ))}
          </div>

          <div {...api.getItemGroupProps()}>
            {images.map((image, index) => (
              <div {...api.getItemProps({ index })} key={image}>
                <div
                  style={{
                    width: "188px",
                    height: "188px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Slide {image}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p>
          <button onClick={onAdd}>add slide</button>
        </p>
      </main>

      <Toolbar>
        <StateVisualizer state={service} omit={["translations"]} />
      </Toolbar>
    </>
  )
}
