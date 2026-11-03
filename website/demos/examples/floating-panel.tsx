import * as floating from "@zag-js/floating-panel"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { LuArrowDownLeft, LuMaximize2, LuMinus, LuX } from "react-icons/lu"
import styles from "../../styles/machines/floating-panel.module.css"
import { Ghost, Log, Row, Stack } from "./shared"

const placements = ["n", "e", "w", "s", "ne", "se", "sw", "nw"] as const

const point = (value: floating.Point) =>
  `${Math.round(value.x)}, ${Math.round(value.y)}`
const size = (value: floating.Size) =>
  `${Math.round(value.width)} × ${Math.round(value.height)}`

function usePanel(props: Partial<floating.Props> = {}) {
  const service = useMachine(floating.machine, { id: useId(), ...props })
  return floating.connect(service, normalizeProps)
}

function Trigger(props: { api: floating.Api }) {
  return (
    <button className={styles.Trigger} {...props.api.getTriggerProps()}>
      Open panel
    </button>
  )
}

function Panel(props: {
  api: floating.Api
  title?: string
  children?: React.ReactNode
}) {
  const { api } = props
  if (!api.open) return null
  return (
    <Portal>
      <div className={styles.Positioner} {...api.getPositionerProps()}>
        <div className={styles.Content} {...api.getContentProps()}>
          <div {...api.getDragTriggerProps()}>
            <div className={styles.Header} {...api.getHeaderProps()}>
              <p className={styles.Title} {...api.getTitleProps()}>
                {props.title ?? "Variables"}
              </p>
              <div className={styles.Control} {...api.getControlProps()}>
                <button {...api.getStageTriggerProps({ stage: "minimized" })}>
                  <LuMinus />
                </button>
                <button {...api.getStageTriggerProps({ stage: "maximized" })}>
                  <LuMaximize2 />
                </button>
                <button {...api.getStageTriggerProps({ stage: "default" })}>
                  <LuArrowDownLeft />
                </button>
                <button {...api.getCloseTriggerProps()}>
                  <LuX />
                </button>
              </div>
            </div>
          </div>
          <div className={styles.Body} {...api.getBodyProps()}>
            {props.children ?? (
              <>
                <p>
                  Size <output>{size(api.size)}</output>
                </p>
                <p>
                  Position <output>{point(api.position)}</output>
                </p>
              </>
            )}
          </div>
          {placements.map((placement) => (
            <div
              key={placement}
              className={styles.ResizeTrigger}
              {...api.getResizeTriggerProps({ placement })}
            />
          ))}
        </div>
      </div>
    </Portal>
  )
}

function Basic(props: {
  options: Partial<floating.Props>
  title?: string
  children?: React.ReactNode
}) {
  const api = usePanel(props.options)
  return (
    <Stack>
      <Trigger api={api} />
      <Panel api={api} title={props.title}>
        {props.children}
      </Panel>
    </Stack>
  )
}

export function FloatingPanelInitialSize() {
  return <Basic options={{ defaultSize: { width: 300, height: 300 } }} />
}

export function FloatingPanelControlledSize() {
  const [value, setValue] = useState<floating.Size>({ width: 300, height: 300 })
  const api = usePanel({
    size: value,
    onSizeChange: (details) => setValue(details.size),
  })
  return (
    <Stack>
      <Row>
        <Trigger api={api} />
        <Ghost onClick={() => setValue({ width: 240, height: 200 })}>
          Small
        </Ghost>
        <Ghost onClick={() => setValue({ width: 420, height: 360 })}>
          Large
        </Ghost>
      </Row>
      <Panel api={api} />
      <Log label="size" value={size(value)} />
    </Stack>
  )
}

export function FloatingPanelDisableResize() {
  return <Basic options={{ resizable: false }} title="Fixed size" />
}

export function FloatingPanelSizeConstraints() {
  return (
    <Basic
      options={{
        minSize: { width: 100, height: 100 },
        maxSize: { width: 500, height: 500 },
      }}
      title="100 to 500px"
    />
  )
}

export function FloatingPanelAspectRatio() {
  return <Basic options={{ lockAspectRatio: true }} title="Locked ratio" />
}

export function FloatingPanelInitialPosition() {
  return <Basic options={{ defaultPosition: { x: 500, y: 200 } }} />
}

export function FloatingPanelAnchorPosition() {
  return (
    <Basic
      options={{
        getAnchorPosition({ triggerRect, boundaryRect }) {
          if (!triggerRect || !boundaryRect) return { x: 0, y: 0 }
          return {
            x: boundaryRect.x + (boundaryRect.width - triggerRect.width) / 2,
            y: boundaryRect.y + (boundaryRect.height - triggerRect.height) / 2,
          }
        },
      }}
    />
  )
}

export function FloatingPanelControlledPosition() {
  const [value, setValue] = useState<floating.Point>({ x: 500, y: 200 })
  const api = usePanel({
    position: value,
    onPositionChange: (details) => setValue(details.position),
  })
  return (
    <Stack>
      <Row>
        <Trigger api={api} />
        <Ghost onClick={() => setValue({ x: 40, y: 120 })}>Move to start</Ghost>
        <Ghost onClick={() => setValue({ x: 500, y: 200 })}>Reset</Ghost>
      </Row>
      <Panel api={api} />
      <Log label="position" value={point(value)} />
    </Stack>
  )
}

export function FloatingPanelDisableDrag() {
  return <Basic options={{ draggable: false }} title="Pinned in place" />
}

export function FloatingPanelStrategy() {
  return (
    <Basic options={{ strategy: "absolute" }} title="Scrolls with the page" />
  )
}

export function FloatingPanelGrid() {
  return <Basic options={{ gridSize: 8 }} title="Snaps to 8px" />
}

export function FloatingPanelOverflow() {
  return <Basic options={{ allowOverflow: true }} title="Drag me off screen" />
}

export function FloatingPanelOpenChange() {
  const [open, setOpen] = useState(false)
  const api = usePanel({ onOpenChange: (details) => setOpen(details.open) })
  return (
    <Stack>
      <Trigger api={api} />
      <Panel api={api} />
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function FloatingPanelPositionChange() {
  const [moving, setMoving] = useState("—")
  const [end, setEnd] = useState("—")
  const api = usePanel({
    onPositionChange: (details) => setMoving(point(details.position)),
    onPositionChangeEnd: (details) => setEnd(point(details.position)),
  })
  return (
    <Stack>
      <Trigger api={api} />
      <Panel api={api} />
      <Log label="onPositionChange" value={moving} />
      <Log label="onPositionChangeEnd" value={end} />
    </Stack>
  )
}

export function FloatingPanelResize() {
  const [resizing, setResizing] = useState("—")
  const [end, setEnd] = useState("—")
  const api = usePanel({
    onSizeChange: (details) => setResizing(size(details.size)),
    onSizeChangeEnd: (details) => setEnd(size(details.size)),
  })
  return (
    <Stack>
      <Trigger api={api} />
      <Panel api={api} />
      <Log label="onSizeChange" value={resizing} />
      <Log label="onSizeChangeEnd" value={end} />
    </Stack>
  )
}

export function FloatingPanelStage() {
  const [stage, setStage] = useState("default")
  const api = usePanel({ onStageChange: (details) => setStage(details.stage) })
  return (
    <Stack>
      <Trigger api={api} />
      <Panel api={api} />
      <Log label="stage" value={stage} />
    </Stack>
  )
}

export function FloatingPanelPersist() {
  return (
    <Basic options={{ persistRect: true }} title="Remembers its rect">
      <p>Move or resize me, close, then reopen.</p>
    </Basic>
  )
}
