import styles from "../../../../../shared/src/css/floating-panel.module.css"
import * as floatingPanel from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-solid"
import { For, createMemo, createSignal, createUniqueId, onCleanup, onMount } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

export default function Page() {
  const id = createUniqueId()
  const [open, setOpen] = createSignal(false)
  const [size, setSize] = createSignal({ width: 360, height: 260 })
  const [position, setPosition] = createSignal({ x: 120, y: 120 })
  const [observedSize, setObservedSize] = createSignal({ width: 0, height: 0 })
  const [observedEl, setObservedEl] = createSignal<HTMLDivElement>()

  let observer: ResizeObserver | null = null

  onMount(() => {
    observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setObservedSize({ width: Math.round(width), height: Math.round(height) })
    })

    const node = observedEl()
    if (node) observer.observe(node)
  })

  onCleanup(() => {
    observer?.disconnect()
    observer = null
  })

  const service = useMachine(floatingPanel.machine, () => ({
    id,
    open: open(),
    defaultOpen: true,
    size: size(),
    position: position(),
    onOpenChange(details) {
      setOpen(details.open)
    },
    onSizeChange(details) {
      setSize(details.size)
    },
    onPositionChange(details) {
      setPosition(details.position)
    },
  }))

  const api = createMemo(() => floatingPanel.connect(service, normalizeProps))

  return (
    <>
      <main class="floating-panel">
        <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap", "margin-bottom": "1rem" }}>
          <button onClick={() => setOpen((prev) => !prev)}>{open() ? "Close" : "Open"} panel</button>
          <button onClick={() => setSize({ width: 420, height: 320 })}>Set size: 420x320</button>
          <button onClick={() => setPosition({ x: 32, y: 32 })}>Set position: (32, 32)</button>
          <button onClick={() => api().setSize({ width: 440, height: 300 })}>API set size: 440x300</button>
          <button onClick={() => api().setPosition({ x: 48, y: 48 })}>API set position: (48, 48)</button>
          <button
            onClick={() => {
              setSize({ width: 360, height: 260 })
              setPosition({ x: 120, y: 120 })
            }}
          >
            Reset rect
          </button>
        </div>

        <div style={{ "margin-bottom": "1rem" }}>
          size: {Math.round(api().size.width)}x{Math.round(api().size.height)} | position: (
          {Math.round(api().position.x)}, {Math.round(api().position.y)})
        </div>

        <div>
          <button {...api().getTriggerProps()}>Toggle Panel</button>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()} class={styles.Content}>
              <div {...api().getDragTriggerProps()}>
                <div {...api().getHeaderProps()} class={styles.Header}>
                  <p {...api().getTitleProps()}>Floating Panel</p>
                  <div {...api().getControlProps()} class={styles.Control}>
                    <button {...api().getStageTriggerProps({ stage: "minimized" })}>
                      <Minus />
                    </button>
                    <button {...api().getStageTriggerProps({ stage: "maximized" })}>
                      <Maximize2 />
                    </button>
                    <button {...api().getStageTriggerProps({ stage: "default" })}>
                      <ArrowDownLeft />
                    </button>
                    <button {...api().getCloseTriggerProps()}>
                      <XIcon />
                    </button>
                  </div>
                </div>
              </div>
              <div {...api().getBodyProps()} class={styles.Body}>
                <p>Drag and resize to update external state.</p>
                <p>Use the buttons above for externally controlled size and position.</p>
                <div
                  ref={setObservedEl}
                  style={{
                    resize: "horizontal",
                    overflow: "auto",
                    "min-width": "180px",
                    "max-width": "100%",
                    padding: "0.5rem",
                    border: "1px solid #d4d4d8",
                    "border-radius": "0.5rem",
                  }}
                >
                  ResizeObserver box: {observedSize().width}x{observedSize().height}
                </div>
              </div>

              <For each={floatingPanel.resizeTriggerAxes}>
                {(axis) => <div {...api().getResizeTriggerProps({ axis })} class={styles.ResizeTrigger} />}
              </For>
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
