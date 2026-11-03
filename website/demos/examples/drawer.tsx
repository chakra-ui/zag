import * as drawer from "@zag-js/drawer"
import {
  normalizeProps,
  Portal,
  useMachine,
  useSyncExternalStore,
} from "@zag-js/react"
import { useId, useState } from "react"
import { HiX } from "react-icons/hi"
import { Presence } from "../../components/docs/presence"
import styles from "../../styles/machines/drawer.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

function useDrawer(props: Partial<drawer.Props> = {}) {
  const service = useMachine(drawer.machine, { id: useId(), ...props })
  return drawer.connect(service, normalizeProps)
}

function Trigger(props: { api: drawer.Api; label?: string }) {
  return (
    <button className={styles.trigger} {...props.api.getTriggerProps()}>
      {props.label ?? "Open drawer"}
    </button>
  )
}

function Sheet(props: {
  api: drawer.Api
  title?: string
  description?: string
  draggable?: boolean
  children?: React.ReactNode
}) {
  const { api } = props
  return (
    <Portal>
      {api.modal && (
        <Presence className={styles.backdrop} {...api.getBackdropProps()} />
      )}
      <div className={styles.positioner} {...api.getPositionerProps()}>
        <Presence
          className={styles.content}
          {...api.getContentProps({ draggable: props.draggable })}
        >
          {api.swipeDirection === "down" && (
            <div className={styles.grabber} {...api.getGrabberProps()}>
              <div
                className={styles.grabberIndicator}
                {...api.getGrabberIndicatorProps()}
              />
            </div>
          )}
          <div className={styles.contentInner}>
            <h2 className={styles.title} {...api.getTitleProps()}>
              {props.title ?? "Notifications"}
            </h2>
            <p className={styles.description} {...api.getDescriptionProps()}>
              {props.description ??
                "Drag the sheet down or press Esc to close."}
            </p>
            {props.children}
          </div>
          <button
            className={styles.closeTrigger}
            {...api.getCloseTriggerProps()}
          >
            <HiX />
          </button>
        </Presence>
      </div>
    </Portal>
  )
}

export function DrawerControlled() {
  const [open, setOpen] = useState(false)
  const api = useDrawer({
    open,
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <Row>
        <Trigger api={api} />
        <Ghost onClick={() => setOpen(true)}>Open from outside</Ghost>
      </Row>
      <Sheet api={api} />
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function DrawerOpenChange() {
  const [open, setOpen] = useState(false)
  const api = useDrawer({ onOpenChange: (details) => setOpen(details.open) })
  return (
    <Stack>
      <Trigger api={api} />
      <Sheet api={api} />
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function DrawerSnapPoints() {
  const [snapPoint, setSnapPoint] = useState<drawer.SnapPoint | null>(0.5)
  const api = useDrawer({
    snapPoints: [0.3, 0.5, 1],
    defaultSnapPoint: 0.5,
    onSnapPointChange: (details) => setSnapPoint(details.snapPoint),
  })
  return (
    <Stack>
      <Trigger api={api} />
      <Sheet
        api={api}
        title="Snap points"
        description="Drag the sheet to snap at 30%, 50% or full height."
      />
      <Log label="snapPoint" value={show(snapPoint)} />
    </Stack>
  )
}

const points = [0.3, 0.5, 1]

export function DrawerControlledSnapPoint() {
  const [snapPoint, setSnapPoint] = useState<drawer.SnapPoint | null>(0.5)
  const api = useDrawer({
    snapPoints: points,
    snapPoint,
    onSnapPointChange: (details) => setSnapPoint(details.snapPoint),
  })
  return (
    <Stack>
      <Trigger api={api} />
      <Sheet api={api} title="Controlled snap point">
        <Row>
          {points.map((point) => (
            <Ghost key={point} onClick={() => setSnapPoint(point)}>
              {point * 100}%
            </Ghost>
          ))}
        </Row>
      </Sheet>
      <Log label="snapPoint" value={show(snapPoint)} />
    </Stack>
  )
}

export function DrawerSwipeDismiss() {
  const api = useDrawer({ swipeVelocityThreshold: 800, closeThreshold: 0.3 })
  return (
    <Stack>
      <Trigger api={api} />
      <Sheet
        api={api}
        description="Flick it down fast, or drag it below 30% of its height to dismiss."
      />
    </Stack>
  )
}

export function DrawerSwipeDirection() {
  const api = useDrawer({ swipeDirection: "end" })
  return (
    <Stack>
      <Trigger api={api} label="Open side drawer" />
      <Sheet
        api={api}
        title="Settings"
        description="This drawer slides in from the inline end. Swipe it back to close."
      />
    </Stack>
  )
}

export function DrawerSequentialSnapPoints() {
  const [snapPoint, setSnapPoint] = useState<drawer.SnapPoint | null>(1)
  const api = useDrawer({
    snapPoints: [0.25, 0.5, 1],
    snapToSequentialPoints: true,
    onSnapPointChange: (details) => setSnapPoint(details.snapPoint),
  })
  return (
    <Stack>
      <Trigger api={api} />
      <Sheet
        api={api}
        title="Sequential snap points"
        description="A fast flick still stops at the next snap point."
      />
      <Log label="snapPoint" value={show(snapPoint)} />
    </Stack>
  )
}

const rows = Array.from({ length: 30 }, (_, index) => `Message ${index + 1}`)

export function DrawerDragOnScroll() {
  const api = useDrawer({ preventDragOnScroll: false })
  return (
    <Stack>
      <Trigger api={api} />
      <Sheet
        api={api}
        title="Inbox"
        description="Dragging the list moves the sheet even mid-scroll."
      >
        <div className={styles.scrollable}>
          {rows.map((row) => (
            <div key={row}>{row}</div>
          ))}
        </div>
      </Sheet>
    </Stack>
  )
}

export function DrawerNonModal() {
  const [count, setCount] = useState(0)
  const api = useDrawer({ modal: false })
  return (
    <Stack>
      <Row>
        <Trigger api={api} />
        <Ghost onClick={() => setCount((n) => n + 1)}>Click behind</Ghost>
      </Row>
      <Sheet api={api} description="The page behind stays interactive." />
      <Log label="clicks behind" value={count} />
    </Stack>
  )
}

export function DrawerSwipeArea() {
  const api = useDrawer()
  return (
    <Stack>
      <div className={styles.swipeArea} {...api.getSwipeAreaProps()}>
        Swipe up here
      </div>
      <Sheet api={api} description="Opened by swiping up on the area." />
    </Stack>
  )
}

const panels = [
  { value: "settings", label: "Settings" },
  { value: "profile", label: "Profile" },
]

export function DrawerMultipleTriggers() {
  const [active, setActive] = useState<string | null>(null)
  const api = useDrawer({
    onTriggerValueChange: (details) => setActive(details.value),
  })
  const panel = panels.find((item) => item.value === api.triggerValue)
  return (
    <Stack>
      <Row>
        {panels.map((item) => (
          <button
            key={item.value}
            className={styles.trigger}
            {...api.getTriggerProps({ value: item.value })}
          >
            {item.label}
          </button>
        ))}
      </Row>
      <Sheet
        api={api}
        title={panel?.label ?? "Drawer"}
        description="One drawer, shared by every trigger."
      />
      <Log label="triggerValue" value={show(active)} />
    </Stack>
  )
}

export function DrawerContentDraggable() {
  const api = useDrawer()
  return (
    <Stack>
      <Trigger api={api} />
      <Sheet
        api={api}
        draggable={false}
        description="Only the grabber at the top drags this sheet."
      >
        <div className={styles.handleOnly}>Dragging here does nothing</div>
      </Sheet>
    </Stack>
  )
}

const stack = drawer.createStack()

export function DrawerStack() {
  const api = useDrawer({ stack })
  const snapshot = useSyncExternalStore(
    stack.subscribe,
    stack.getSnapshot,
    stack.getSnapshot,
  )
  const stackApi = drawer.connectStack(snapshot, normalizeProps)
  return (
    <div className={styles.sandbox}>
      <div
        className={styles.indentBackground}
        {...stackApi.getIndentBackgroundProps()}
      />
      <div className={styles.indent} {...stackApi.getIndentProps()}>
        <p className={styles.description}>This card recedes when it opens.</p>
        <Trigger api={api} />
      </div>
      <Sheet api={api} />
    </div>
  )
}

export function DrawerEscape() {
  const api = useDrawer({ closeOnEscape: false })
  return (
    <Stack>
      <Trigger api={api} />
      <Sheet
        api={api}
        description="Esc won't close this drawer. Drag it down or use the close button."
      />
    </Stack>
  )
}

export function DrawerReadState() {
  const api = useDrawer({ snapPoints: [0.5, 1], defaultSnapPoint: 0.5 })
  const percentage = api.getOpenPercentage()
  const size = api.getContentSize()
  return (
    <Stack>
      <Trigger api={api} />
      <Sheet api={api} title="Drawer state">
        <Log label="getSnapPointIndex()" value={api.getSnapPointIndex()} />
        <Log
          label="getContentSize()"
          value={size == null ? "—" : `${size}px`}
        />
      </Sheet>
      <Log label="getOpenPercentage()" value={percentage.toFixed(2)} />
    </Stack>
  )
}
