import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import type { JSX } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/carousel.css"

// Variable width content (content-driven sizing)
const variableWidthData = [
  { content: "Short", color: "#ff6b6b", type: "text" },
  {
    content: "This is a much longer slide with significantly more content that will naturally take up more space",
    color: "#4ecdc4",
    type: "text",
  },
  { content: "Hi", color: "#45b7d1", type: "text" },
  { content: "Medium length slide content here", color: "#96ceb4", type: "text" },
  { content: "⭐ Star Rating Widget ⭐⭐⭐⭐⭐", color: "#ffeaa7", type: "widget" },
  { content: "X", color: "#dda0dd", type: "text" },
  { content: "🔥 Popular Item with Badge 🔥", color: "#98d8c8", type: "badge" },
  { content: "A", color: "#e74c3c", type: "text" },
  { content: "📊 Analytics Dashboard Component 📈📉", color: "#9b59b6", type: "component" },
]

const slideStyle = (color: string): JSX.CSSProperties => ({
  "min-height": "120px",
  "background-color": color,
  "border-radius": "8px",
  color: "white",
  "font-weight": "bold",
  "text-align": "center",
  padding: "16px",
  "box-sizing": "border-box",
})

const indicatorStyle = (active: boolean): JSX.CSSProperties => ({
  width: "12px",
  height: "12px",
  "border-radius": "50%",
  border: "none",
  "background-color": active ? "#333" : "#ccc",
  margin: "0 4px",
  cursor: "pointer",
})

export default function Page() {
  const service = useMachine(carousel.machine, {
    id: createUniqueId(),
    autoSize: true,
    spacing: "16px",
    count: variableWidthData.length,
    allowMouseDrag: true,
    snapType: "mandatory",
  })

  const api = createMemo(() => carousel.connect(service, normalizeProps))

  return (
    <>
      <main class="carousel-auto-size">
        <div {...api().getRootProps()}>
          <h2>Auto Size Carousel</h2>
          <p>Each slide has a different size based on its content.</p>

          <div {...api().getControlProps()}>
            <button {...api().getAutoplayTriggerProps()}>
              <Show when={api().isPlaying} fallback="Play">
                Stop
              </Show>
            </button>
            <div class="carousel-spacer" />
            <button {...api().getPrevTriggerProps()}>← Prev</button>
            <button {...api().getNextTriggerProps()}>Next →</button>
          </div>

          <div {...api().getItemGroupProps()}>
            <Index each={variableWidthData}>
              {(slide, index) => {
                const itemProps = createMemo(() => api().getItemProps({ index }))
                const alignedProps = createMemo(() => api().getItemProps({ index, snapAlign: "center" }))
                return (
                  <div
                    {...itemProps()}
                    style={{ ...(alignedProps().style as JSX.CSSProperties), ...slideStyle(slide().color) }}
                  >
                    {slide().content}
                  </div>
                )
              }}
            </Index>
          </div>

          <div {...api().getIndicatorGroupProps()}>
            <Index each={variableWidthData}>
              {(_, index) => (
                <button {...api().getIndicatorProps({ index })} style={indicatorStyle(index === api().page)} />
              )}
            </Index>
          </div>

          <div {...api().getProgressTextProps()}>{api().getProgressText()}</div>
        </div>

        <div style={{ "margin-top": "32px" }}>
          <h3>Comparison: Fixed Width Carousel</h3>
          <FixedWidthExample />
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} omit={["translations"]} />
      </Toolbar>

      <style>{`
        .carousel-auto-size {
          padding: 32px;
          max-width: 800px;
          margin: 0 auto;
        }

        .carousel-auto-size .carousel-spacer {
          flex: 1;
        }

        .carousel-auto-size h2 {
          margin-bottom: 8px;
        }

        .carousel-auto-size p {
          margin-bottom: 24px;
          color: #666;
        }
      `}</style>
    </>
  )
}

function FixedWidthExample() {
  const service = useMachine(carousel.machine, {
    id: createUniqueId(),
    autoSize: false,
    spacing: "16px",
    slidesPerPage: 2,
    count: variableWidthData.length,
    allowMouseDrag: true,
  })

  const api = createMemo(() => carousel.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <div {...api().getControlProps()}>
        <button {...api().getPrevTriggerProps()}>← Prev</button>
        <div class="carousel-spacer" />
        <button {...api().getNextTriggerProps()}>Next →</button>
      </div>

      <div {...api().getItemGroupProps()}>
        <Index each={variableWidthData}>
          {(slide, index) => {
            const itemProps = createMemo(() => api().getItemProps({ index }))
            return (
              <div
                {...itemProps()}
                style={{
                  ...(itemProps().style as JSX.CSSProperties),
                  ...slideStyle(slide().color),
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "center",
                }}
              >
                {slide().content}
              </div>
            )
          }}
        </Index>
      </div>

      <div {...api().getIndicatorGroupProps()}>
        <Index each={api().pageSnapPoints}>
          {(_, index) => (
            <button {...api().getIndicatorProps({ index })} style={indicatorStyle(index === api().page)} />
          )}
        </Index>
      </div>
    </div>
  )
}
