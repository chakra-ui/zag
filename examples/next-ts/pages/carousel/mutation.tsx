import styles from "../../../../shared/src/css/carousel.module.css"
import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useCallback, useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

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
        <div {...api.getRootProps()} className={styles.Root}>
          <div {...api.getControlProps()} className={styles.Control}>
            <button {...api.getAutoplayTriggerProps()} className={styles.AutoplayTrigger}>{api.isPlaying ? "Stop" : "Play"}</button>
            <div className="carousel-spacer" />
            <button {...api.getPrevTriggerProps()}>&laquo;</button>
            <button {...api.getNextTriggerProps()}>&raquo;</button>
          </div>

          <div {...api.getIndicatorGroupProps()} className={styles.IndicatorGroup}>
            {api.pageSnapPoints.map((_, i) => (
              <button {...api.getIndicatorProps({ index: i })} className={styles.Indicator} key={i}>
                {i}
              </button>
            ))}
          </div>

          <div {...api.getItemGroupProps()} className={styles.ItemGroup}>
            {images.map((image, index) => (
              <div {...api.getItemProps({ index })} className={styles.Item} key={image}>
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
