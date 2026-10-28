import { normalizeProps, useMachine } from "@zag-js/react"
import * as splitter from "@zag-js/splitter"
import { useId, useState } from "react"
import styles from "../../styles/machines/splitter.module.css"
import { Button, Log, Row, Stack, show } from "./shared"

const pair = [{ id: "a" }, { id: "b" }]

function useSplitter(props: Partial<splitter.Props> = {}) {
  const service = useMachine(splitter.machine, {
    id: useId(),
    panels: pair,
    defaultSize: [50, 50],
    ...props,
  })
  return splitter.connect(service, normalizeProps)
}

const sizes = (value: number[]) => value.map((n) => Math.round(n)).join(" / ")

function Split(props: {
  api: splitter.Api
  labels?: [React.ReactNode, React.ReactNode]
}) {
  const { api, labels = ["A", "B"] } = props
  return (
    <div className={styles.Frame} data-orientation={api.orientation}>
      <div className={styles.Root} {...api.getRootProps()}>
        <div className={styles.Panel} {...api.getPanelProps({ id: "a" })}>
          <p>{labels[0]}</p>
        </div>
        <div
          className={styles.ResizeTrigger}
          {...api.getResizeTriggerProps({ id: "a:b" })}
        />
        <div className={styles.Panel} {...api.getPanelProps({ id: "b" })}>
          <p>{labels[1]}</p>
        </div>
      </div>
    </div>
  )
}

export function SplitterDefaultSize() {
  const api = useSplitter({ defaultSize: [40, 60] })
  return <Split api={api} />
}

export function SplitterControlled() {
  const [size, setSize] = useState([50, 50])
  const api = useSplitter({
    panels: pair,
    size,
    onResize(details) {
      setSize(details.size)
    },
  })
  return (
    <Stack>
      <Split api={api} />
      <Row>
        <Button onClick={() => setSize([25, 75])}>25 / 75</Button>
        <Button onClick={() => setSize([50, 50])}>50 / 50</Button>
        <Button onClick={() => setSize([75, 25])}>75 / 25</Button>
      </Row>
      <Log label="size" value={sizes(size)} />
    </Stack>
  )
}

export function SplitterResizeEvents() {
  const [event, setEvent] = useState("—")
  const [size, setSize] = useState("—")
  const api = useSplitter({
    onResize(detail) {
      setSize(sizes(detail.size))
    },
    onResizeStart() {
      setEvent("resize start")
    },
    onResizeEnd(detail) {
      setEvent(`resize end ${sizes(detail.size)}`)
    },
  })
  return (
    <Stack>
      <Split api={api} />
      <Log label="onResize" value={size} />
      <Log label="last event" value={event} />
    </Stack>
  )
}

export function SplitterVertical() {
  const api = useSplitter({ orientation: "vertical" })
  return <Split api={api} />
}

export function SplitterConstraints() {
  const api = useSplitter({
    panels: [
      { id: "a", minSize: 20, maxSize: 80 },
      { id: "b", minSize: 20, maxSize: 80 },
    ],
  })
  return (
    <Stack>
      <Split api={api} labels={["20–80%", "20–80%"]} />
      <Log label="size" value={sizes(api.getSizes())} />
    </Stack>
  )
}

export function SplitterKeyboard() {
  const api = useSplitter({ keyboardResizeBy: 16 })
  return (
    <Stack>
      <Split api={api} />
      <Log label="size" value={sizes(api.getSizes())} />
    </Stack>
  )
}

const collapsible = [
  { id: "a", collapsible: true, collapsedSize: 5, minSize: 10, maxSize: 20 },
  { id: "b", minSize: 50 },
]

export function SplitterCollapsible() {
  const api = useSplitter({ panels: collapsible, defaultSize: [20, 80] })
  return (
    <Stack>
      <Split api={api} labels={["Nav", "Content"]} />
      <Log label="size" value={sizes(api.getSizes())} />
    </Stack>
  )
}

export function SplitterCollapseEvents() {
  const [event, setEvent] = useState("—")
  const api = useSplitter({
    panels: collapsible,
    defaultSize: [20, 80],
    onCollapse(detail) {
      setEvent(`collapse ${show(detail)}`)
    },
    onExpand(detail) {
      setEvent(`expand ${show(detail)}`)
    },
  })
  return (
    <Stack>
      <Split api={api} labels={["Nav", "Content"]} />
      <Log label="last event" value={event} />
    </Stack>
  )
}

export function SplitterProgrammatic() {
  const api = useSplitter({ panels: collapsible, defaultSize: [20, 80] })
  return (
    <Stack>
      <Split api={api} labels={["Nav", "Content"]} />
      <Row>
        <Button onClick={() => api.setSizes([15, 85])}>setSizes</Button>
        <Button onClick={() => api.resizePanel("a", 10)}>resizePanel</Button>
        <Button onClick={() => api.collapsePanel("a")}>collapse</Button>
        <Button onClick={() => api.expandPanel("a")}>expand</Button>
        <Button onClick={() => api.resetSizes()}>reset</Button>
      </Row>
      <Log label="size" value={sizes(api.getSizes())} />
    </Stack>
  )
}

export function SplitterRegistry() {
  const [registry] = useState(() => splitter.registry())

  const horizontalService = useMachine(splitter.machine, {
    id: useId(),
    panels: [{ id: "left" }, { id: "right" }],
    registry,
  })
  const horizontal = splitter.connect(horizontalService, normalizeProps)

  const verticalService = useMachine(splitter.machine, {
    id: useId(),
    orientation: "vertical",
    panels: [{ id: "top" }, { id: "bottom" }],
    registry,
  })
  const vertical = splitter.connect(verticalService, normalizeProps)

  return (
    <div className={styles.Frame}>
      <div className={styles.Root} {...horizontal.getRootProps()}>
        <div
          className={styles.Panel}
          {...horizontal.getPanelProps({ id: "left" })}
        >
          <p>Left</p>
        </div>
        <div
          className={styles.ResizeTrigger}
          {...horizontal.getResizeTriggerProps({ id: "left:right" })}
        />
        <div
          className={styles.NestedPanel}
          {...horizontal.getPanelProps({ id: "right" })}
        >
          <div className={styles.Root} {...vertical.getRootProps()}>
            <div
              className={styles.Panel}
              {...vertical.getPanelProps({ id: "top" })}
            >
              <p>Top</p>
            </div>
            <div
              className={styles.ResizeTrigger}
              {...vertical.getResizeTriggerProps({ id: "top:bottom" })}
            />
            <div
              className={styles.Panel}
              {...vertical.getPanelProps({ id: "bottom" })}
            >
              <p>Bottom</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const splitterExamples = {
  SplitterDefaultSize,
  SplitterControlled,
  SplitterResizeEvents,
  SplitterVertical,
  SplitterConstraints,
  SplitterKeyboard,
  SplitterCollapsible,
  SplitterCollapseEvents,
  SplitterProgrammatic,
  SplitterRegistry,
}
