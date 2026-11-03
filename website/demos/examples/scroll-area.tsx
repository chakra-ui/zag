import { normalizeProps, useMachine, type PropTypes } from "@zag-js/react"
import * as scrollArea from "@zag-js/scroll-area"
import { useEffect, useId, useState } from "react"
import styles from "../../styles/machines/scroll-area.module.css"
import { Button, Log, Row, Stack } from "./shared"

function useScrollArea() {
  const service = useMachine(scrollArea.machine, { id: useId() })
  return scrollArea.connect(service, normalizeProps)
}

function Area(props: {
  api: scrollArea.Api<PropTypes>
  count?: number
  wide?: boolean
  conditional?: boolean
}) {
  const { api, count = 30, wide, conditional } = props
  const showY = !conditional || api.hasOverflowY
  const showX = wide && (!conditional || api.hasOverflowX)
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Viewport} {...api.getViewportProps()}>
        <div
          className={styles.Content}
          data-wide={wide || undefined}
          {...api.getContentProps()}
        >
          {Array.from({ length: count }).map((_, index) => (
            <div key={index}>Item {index + 1}</div>
          ))}
        </div>
      </div>
      {showY && (
        <div
          className={styles.Scrollbar}
          {...api.getScrollbarProps({ orientation: "vertical" })}
        >
          <div
            className={styles.Thumb}
            {...api.getThumbProps({ orientation: "vertical" })}
          />
        </div>
      )}
      {showX && (
        <div
          className={styles.Scrollbar}
          {...api.getScrollbarProps({ orientation: "horizontal" })}
        >
          <div
            className={styles.Thumb}
            {...api.getThumbProps({ orientation: "horizontal" })}
          />
        </div>
      )}
      {wide && <div {...api.getCornerProps()} />}
    </div>
  )
}

export function ScrollAreaScrollToEdge() {
  const api = useScrollArea()
  return (
    <Stack>
      <Area api={api} />
      <Row>
        <Button onClick={() => api.scrollToEdge({ edge: "bottom" })}>
          Bottom
        </Button>
        <Button
          onClick={() =>
            api.scrollToEdge({
              edge: "top",
              duration: 500,
              easing: (t) => t * t,
            })
          }
        >
          Top (eased)
        </Button>
      </Row>
    </Stack>
  )
}

export function ScrollAreaScrollTo() {
  const api = useScrollArea()
  return (
    <Stack>
      <Area api={api} wide />
      <Row>
        <Button onClick={() => api.scrollTo({ top: 100, left: 50 })}>
          top 100, left 50
        </Button>
        <Button
          onClick={() =>
            api.scrollTo({ top: 200, behavior: "smooth", duration: 300 })
          }
        >
          top 200, smooth
        </Button>
      </Row>
    </Stack>
  )
}

function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

export function ScrollAreaState() {
  const api = useScrollArea()
  const mounted = useMounted()
  const progress = mounted ? api.getScrollProgress() : { x: 0, y: 0 }
  return (
    <Stack>
      <Area api={api} />
      <Log
        label="edges"
        value={`top ${api.isAtTop} · bottom ${api.isAtBottom}`}
      />
      <Log
        label="overflow"
        value={`x ${api.hasOverflowX} · y ${api.hasOverflowY}`}
      />
      <Log label="progress.y" value={progress.y.toFixed(2)} />
    </Stack>
  )
}

export function ScrollAreaConditional() {
  const [count, setCount] = useState(3)
  const api = useScrollArea()
  return (
    <Stack>
      <Area api={api} count={count} conditional />
      <Row>
        <Button onClick={() => setCount(3)}>3 items</Button>
        <Button onClick={() => setCount(30)}>30 items</Button>
      </Row>
      <Log label="hasOverflowY" value={String(api.hasOverflowY)} />
    </Stack>
  )
}

export function ScrollAreaScrollbarState() {
  const api = useScrollArea()
  const state = api.getScrollbarState({ orientation: "vertical" })
  return (
    <Stack>
      <Area api={api} />
      <Log
        label="vertical"
        value={`hovering ${state.hovering} · scrolling ${state.scrolling} · hidden ${state.hidden}`}
      />
    </Stack>
  )
}

export const scrollAreaExamples = {
  ScrollAreaScrollToEdge,
  ScrollAreaScrollTo,
  ScrollAreaState,
  ScrollAreaConditional,
  ScrollAreaScrollbarState,
}
