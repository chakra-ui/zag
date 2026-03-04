import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"
import styles from "../styles/machines/carousel.module.css"

const items = [
  "https://tinyurl.com/5b6ka8jd",
  "https://tinyurl.com/7rmccdn5",
  "https://tinyurl.com/59jxz9uu",
  "https://tinyurl.com/6jurv23t",
  "https://tinyurl.com/yp4rfum7",
]

interface CarouselProps extends Omit<carousel.Props, "id" | "slideCount"> {}

export function Carousel(props: CarouselProps) {
  const service = useMachine(carousel.machine, {
    id: useId(),
    ...props,
    slideCount: items.length,
  })

  const api = carousel.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.ItemGroup} {...api.getItemGroupProps()}>
        {items.map((image, index) => (
          <div
            className={styles.Item}
            {...api.getItemProps({ index })}
            key={index}
          >
            <img src={image} alt={`Slide Image ${index}`} />
          </div>
        ))}
      </div>

      <div className={styles.Control} {...api.getControlProps()}>
        <button className={styles.PrevTrigger} {...api.getPrevTriggerProps()}>
          <HiChevronLeft />
        </button>
        <div
          className={styles.IndicatorGroup}
          {...api.getIndicatorGroupProps()}
        >
          {api.pageSnapPoints.map((_, index) => (
            <button
              className={styles.Indicator}
              key={index}
              {...api.getIndicatorProps({ index })}
            />
          ))}
        </div>
        <button className={styles.NextTrigger} {...api.getNextTriggerProps()}>
          <HiChevronRight />
        </button>
      </div>
    </div>
  )
}
