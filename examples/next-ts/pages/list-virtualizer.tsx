import { ListVirtualizer } from "@zag-js/virtualizer"
import { useCallback, useLayoutEffect, useReducer, useRef, useState } from "react"
import { flushSync } from "react-dom"

const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`,
  }))

export default function Page() {
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)
  const virtualizerRef = useRef<ListVirtualizer | null>(null)
  const [, rerender] = useReducer(() => ({}), {})

  const [items] = useState(() => generateItems(10000))

  if (!virtualizerRef.current) {
    virtualizerRef.current = new ListVirtualizer({
      count: items.length,
      estimatedSize: () => 80,
      overscan: { count: 5 },
      gap: 0,
      paddingStart: 0,
      paddingEnd: 0,
      initialSize: 400, // Set initial viewport size to match container height
      getScrollingEl: () => scrollElementRef.current,
      onRangeChange: () => {
        if (!isInitializedRef.current) return
        flushSync(rerender)
      },
    })
    // Trigger re-render after creating virtualizer
    rerender()
  }

  const virtualizer = virtualizerRef.current

  // Callback ref to measure when element mounts
  const setScrollElementRef = useCallback(
    (element: HTMLDivElement | null) => {
      scrollElementRef.current = element
      if (element && virtualizer) {
        virtualizer.measure()
        isInitializedRef.current = true
        rerender()
      }
    },
    [virtualizer],
  )

  // Cleanup on unmount
  useLayoutEffect(() => {
    const virtualizer = virtualizerRef.current
    return () => {
      virtualizer?.destroy()
    }
  }, [])

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <main className="list-virtualizer">
      <div style={{ padding: "20px" }}>
        <h1>List Virtualizer Example</h1>
        <p>Scrolling through {items.length.toLocaleString()} items efficiently</p>

        <div
          ref={setScrollElementRef}
          onScroll={(e) => {
            flushSync(() => {
              virtualizer.handleScroll(e)
            })
          }}
          style={{
            height: "400px",
            overflow: "auto",
            border: "1px solid #ccc",
            borderRadius: "8px",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              height: `${totalSize}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualItem) => {
              const item = items[virtualItem.index]
              const style = virtualizer.getItemStyle(virtualItem)

              return (
                <div
                  key={virtualItem.index}
                  data-index={virtualItem.index}
                  style={{
                    ...style,
                    padding: "16px",
                    backgroundColor: virtualItem.index % 2 === 0 ? "#f8f9fa" : "#ffffff",
                    border: "1px solid #e1e5e9",
                    borderRadius: "6px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontWeight: "600",
                      fontSize: "16px",
                      color: "#1a1a1a",
                    }}
                  >
                    {item.name}
                  </div>
                  <p>{item.description}</p>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      fontFamily: "monospace",
                    }}
                  >
                    Virtual Index: {virtualItem.index} | Start: {virtualItem.start}px | Size: {virtualItem.size}px
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ marginTop: "16px", fontSize: "14px", color: "#6b7280" }}>
          <div>Total items: {items.length.toLocaleString()}</div>
          <div>Rendered items: {virtualItems.length}</div>
          <div>Total height: {totalSize}px</div>
          <div>
            Visible range: {virtualItems[0]?.index ?? 0} - {virtualItems[virtualItems.length - 1]?.index ?? 0}
          </div>
          {virtualItems.length > 100 && (
            <div style={{ color: "orange" }}>⚠️ Many items rendered (fast scroll mode)</div>
          )}
          {virtualItems.length <= 100 && <div style={{ color: "green" }}>✅ Virtualization working!</div>}
        </div>
      </div>
    </main>
  )
}
