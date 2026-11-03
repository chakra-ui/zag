import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { HiChevronLeft, HiChevronRight, HiPause, HiPlay } from "react-icons/hi"
import styles from "../../styles/machines/carousel.module.css"
import { Button, Log, Row, Stack } from "./shared"

const items = [
  "https://tinyurl.com/5b6ka8jd",
  "https://tinyurl.com/7rmccdn5",
  "https://tinyurl.com/59jxz9uu",
  "https://tinyurl.com/6jurv23t",
  "https://tinyurl.com/yp4rfum7",
]

function useCarousel(props: Partial<carousel.Props> = {}) {
  const service = useMachine(carousel.machine, {
    id: useId(),
    count: items.length,
    ...props,
  })
  return carousel.connect(service, normalizeProps)
}

function Slides(props: {
  api: carousel.Api
  autoplay?: boolean
  widths?: string[]
}) {
  const { api, widths } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.ItemGroup} {...api.getItemGroupProps()}>
        {items.map((image, index) => {
          const itemProps = api.getItemProps({ index })
          return (
            <div
              key={index}
              className={styles.Item}
              {...itemProps}
              style={{ ...itemProps.style, width: widths?.[index] }}
            >
              <img src={image} alt={`Slide ${index + 1}`} draggable={false} />
            </div>
          )
        })}
      </div>
      <div className={styles.Control} {...api.getControlProps()}>
        <button
          className={styles.PrevTrigger}
          {...api.getPreviousTriggerProps()}
        >
          <HiChevronLeft />
        </button>
        <div
          className={styles.IndicatorGroup}
          {...api.getIndicatorGroupProps()}
        >
          {api.pageSnapPoints.map((_, index) => (
            <button
              key={index}
              className={styles.Indicator}
              {...api.getIndicatorProps({ index })}
            />
          ))}
        </div>
        <button className={styles.NextTrigger} {...api.getNextTriggerProps()}>
          <HiChevronRight />
        </button>
        {props.autoplay && (
          <button
            className={styles.AutoplayTrigger}
            {...api.getAutoplayTriggerProps()}
          >
            {api.isPlaying ? <HiPause /> : <HiPlay />}
          </button>
        )}
      </div>
    </div>
  )
}

export function CarouselVertical() {
  const api = useCarousel({ orientation: "vertical" })
  return <Slides api={api} />
}

export function CarouselInitialPage() {
  const api = useCarousel({ defaultPage: 2 })
  return <Slides api={api} />
}

export function CarouselControlled() {
  const [page, setPage] = useState(0)
  const api = useCarousel({
    page,
    onPageChange(details) {
      setPage(details.page)
    },
  })
  return (
    <Stack>
      <Slides api={api} />
      <Row>
        <Button onClick={() => setPage(0)}>First</Button>
        <Button onClick={() => setPage(items.length - 1)}>Last</Button>
      </Row>
      <Log label="page" value={page} />
    </Stack>
  )
}

export function CarouselSlidesPerPage() {
  const api = useCarousel({ slidesPerPage: 2, spacing: "8px" })
  return <Slides api={api} />
}

export function CarouselSlidesPerMove() {
  const api = useCarousel({
    slidesPerPage: 3,
    slidesPerMove: 2,
    spacing: "8px",
  })
  return <Slides api={api} />
}

export function CarouselLoop() {
  const api = useCarousel({ loop: true })
  return <Slides api={api} />
}

export function CarouselSpacing() {
  const api = useCarousel({ slidesPerPage: 2, spacing: "16px" })
  return <Slides api={api} />
}

export function CarouselItemSpacing() {
  const api = useCarousel({ itemSpacing: "16px", spacing: "8px" })
  return <Slides api={api} />
}

export function CarouselAutoSize() {
  const api = useCarousel({ autoSize: true, spacing: "8px" })
  return <Slides api={api} widths={["60%", "35%", "80%", "45%", "55%"]} />
}

export function CarouselPageChange() {
  const [page, setPage] = useState(0)
  const api = useCarousel({
    onPageChange(details) {
      setPage(details.page)
    },
  })
  return (
    <Stack>
      <Slides api={api} />
      <Log label="onPageChange" value={`page ${page}`} />
    </Stack>
  )
}

export function CarouselStatus() {
  const [drag, setDrag] = useState("—")
  const [autoplay, setAutoplay] = useState("—")
  const api = useCarousel({
    allowMouseDrag: true,
    autoPlay: { delay: 2000 },
    onDragStatusChange(details) {
      setDrag(`${details.type} ${details.isDragging}`)
    },
    onAutoplayStatusChange(details) {
      setAutoplay(`${details.type} ${details.isPlaying}`)
    },
  })
  return (
    <Stack>
      <Slides api={api} autoplay />
      <Log label="drag" value={drag} />
      <Log label="autoplay" value={autoplay} />
    </Stack>
  )
}

export function CarouselMouseDrag() {
  const api = useCarousel({ allowMouseDrag: true })
  return <Slides api={api} />
}

export function CarouselAutoplay() {
  const api = useCarousel({ autoPlay: { delay: 2000 }, loop: true })
  return <Slides api={api} autoplay />
}

export const carouselExamples = {
  CarouselVertical,
  CarouselInitialPage,
  CarouselControlled,
  CarouselSlidesPerPage,
  CarouselSlidesPerMove,
  CarouselLoop,
  CarouselSpacing,
  CarouselItemSpacing,
  CarouselAutoSize,
  CarouselPageChange,
  CarouselStatus,
  CarouselMouseDrag,
  CarouselAutoplay,
}
