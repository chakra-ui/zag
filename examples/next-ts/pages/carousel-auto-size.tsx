import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

// Sample data with variable width content (content-driven sizing)
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

export default function Page() {
  const service = useMachine(carousel.machine, {
    id: useId(),
    autoSize: true,
    spacing: "16px",
    slideCount: variableWidthData.length,
    allowMouseDrag: true,
    snapType: "mandatory",
  })

  const api = carousel.connect(service, normalizeProps)

  return (
    <>
      <main className="carousel-auto-size">
        <div {...api.getRootProps()}>
          <h2>Auto Size Carousel</h2>
          <p>Each slide has a different size based on its content.</p>

          <div {...api.getControlProps()}>
            <button {...api.getAutoplayTriggerProps()}>{api.isPlaying ? "Stop" : "Play"}</button>
            <div className="carousel-spacer" />
            <button {...api.getPrevTriggerProps()}>← Prev</button>
            <button {...api.getNextTriggerProps()}>Next →</button>
          </div>

          <div {...api.getItemGroupProps()}>
            {variableWidthData.map((slide, index) => {
              const itemProps = api.getItemProps({ index, snapAlign: "center" })
              return (
                <div
                  {...api.getItemProps({ index })}
                  key={index}
                  style={{
                    ...itemProps.style, // Carousel's flex styles first
                    // Then add our visual styles
                    minHeight: "120px",
                    backgroundColor: slide.color,
                    borderRadius: "8px",
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    padding: "16px",
                    boxSizing: "border-box",
                  }}
                >
                  {slide.content}
                </div>
              )
            })}
          </div>

          <div {...api.getIndicatorGroupProps()}>
            {variableWidthData.map((_, index) => (
              <button
                {...api.getIndicatorProps({ index })}
                key={index}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: index === api.page ? "#333" : "#ccc",
                  margin: "0 4px",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          <div {...api.getProgressTextProps()}>{api.getProgressText()}</div>
        </div>

        <div style={{ marginTop: "32px" }}>
          <h3>Comparison: Fixed Width Carousel</h3>
          <FixedWidthExample />
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} omit={["translations"]} />
      </Toolbar>

      <style jsx>{`
        .carousel-auto-size {
          padding: 32px;
          max-width: 800px;
          margin: 0 auto;
        }

        .carousel-spacer {
          flex: 1;
        }

        h2 {
          margin-bottom: 8px;
        }

        p {
          margin-bottom: 24px;
          color: #666;
        }
      `}</style>
    </>
  )
}

function FixedWidthExample() {
  const service = useMachine(carousel.machine, {
    id: useId(),
    autoSize: false,
    spacing: "16px",
    slidesPerPage: 2,
    slideCount: variableWidthData.length,
    allowMouseDrag: true,
  })

  const api = carousel.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getControlProps()}>
        <button {...api.getPrevTriggerProps()}>← Prev</button>
        <div className="carousel-spacer" />
        <button {...api.getNextTriggerProps()}>Next →</button>
      </div>

      <div {...api.getItemGroupProps()}>
        {variableWidthData.map((slide, index) => {
          const itemProps = api.getItemProps({ index })
          return (
            <div
              {...itemProps}
              key={index}
              style={{
                ...itemProps.style, // Let carousel control layout (grid for fixed width)
                // Only add visual styles
                minHeight: "120px",
                backgroundColor: slide.color,
                borderRadius: "8px",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
                padding: "16px",
                boxSizing: "border-box",
                display: "flex", // Safe to add for content centering in grid items
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {slide.content}
            </div>
          )
        })}
      </div>

      <div {...api.getIndicatorGroupProps()}>
        {api.pageSnapPoints.map((_, index) => (
          <button
            {...api.getIndicatorProps({ index })}
            key={index}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: index === api.page ? "#333" : "#ccc",
              margin: "0 4px",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  )
}
