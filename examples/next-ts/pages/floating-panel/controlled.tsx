import styles from "../../../../shared/src/css/floating-panel.module.css"
import * as floating from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

function AutoSizingContent() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({
        width: Math.round(width),
        height: Math.round(height),
      })
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        resize: "horizontal",
        overflow: "auto",
        minWidth: "180px",
        maxWidth: "100%",
        padding: "0.5rem",
        border: "1px solid #d4d4d8",
        borderRadius: "0.5rem",
      }}
    >
      ResizeObserver box: {size.width}x{size.height}
    </div>
  )
}

export default function Page() {
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState({ width: 360, height: 260 })
  const [position, setPosition] = useState({ x: 120, y: 120 })

  const service = useMachine(floating.machine, {
    id: useId(),
    open: open,
    defaultOpen: true,
    size: size,
    position: position,
    onOpenChange(details) {
      setOpen(details.open)
    },
    onSizeChange(details) {
      setSize(details.size)
    },
    onPositionChange(details) {
      setPosition(details.position)
    },
  })

  const api = floating.connect(service, normalizeProps)

  return (
    <main className="floating-panel">
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <button onClick={() => setOpen((prev) => !prev)}>{open ? "Close" : "Open"} panel</button>
        <button onClick={() => setSize({ width: 420, height: 320 })}>Set size: 420x320</button>
        <button onClick={() => setPosition({ x: 32, y: 32 })}>Set position: (32, 32)</button>
        <button onClick={() => api.setSize({ width: 440, height: 300 })}>API set size: 440x300</button>
        <button onClick={() => api.setPosition({ x: 48, y: 48 })}>API set position: (48, 48)</button>
        <button
          onClick={() => {
            setSize({ width: 360, height: 260 })
            setPosition({ x: 120, y: 120 })
          }}
        >
          Reset rect
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        size: {Math.round(api.size.width)}x{Math.round(api.size.height)} | position: ({Math.round(api.position.x)},{" "}
        {Math.round(api.position.y)})
      </div>

      <div>
        <button {...api.getTriggerProps()}>Toggle Panel</button>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()} className={styles.Content}>
            <div {...api.getDragTriggerProps()}>
              <div {...api.getHeaderProps()} className={styles.Header}>
                <p {...api.getTitleProps()}>Floating Panel</p>
                <div {...api.getControlProps()} className={styles.Control}>
                  <button {...api.getStageTriggerProps({ stage: "minimized" })}>
                    <Minus />
                  </button>
                  <button {...api.getStageTriggerProps({ stage: "maximized" })}>
                    <Maximize2 />
                  </button>
                  <button {...api.getStageTriggerProps({ stage: "default" })}>
                    <ArrowDownLeft />
                  </button>
                  <button {...api.getCloseTriggerProps()}>
                    <XIcon />
                  </button>
                </div>
              </div>
            </div>
            <div {...api.getBodyProps()} className={styles.Body}>
              <p>Drag and resize to update external state.</p>
              <p>Use the buttons above for externally controlled size and position.</p>
              <AutoSizingContent />
            </div>

            {floating.resizeTriggerAxes.map((axis) => (
              <div key={axis} {...api.getResizeTriggerProps({ axis })} className={styles.ResizeTrigger} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
