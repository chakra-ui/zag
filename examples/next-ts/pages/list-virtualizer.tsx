import { ListVirtualizer } from "@zag-js/virtualizer"
import { useCallback, useReducer, useRef, useState } from "react"
import { flushSync } from "react-dom"

const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`,
  }))

const items = generateItems(10000)

export default function Page() {
  const isInitializedRef = useRef(false)
  const [isSmooth, setIsSmooth] = useState(true)
  const [virtualizer] = useState<ListVirtualizer | null>(() => {
    return new ListVirtualizer({
      count: items.length,
      estimatedSize: () => 142,
      overscan: { count: 5 },
      gap: 0,
      paddingStart: 0,
      paddingEnd: 0,
      onRangeChange: () => {
        if (!isInitializedRef.current) return
        flushSync(rerender)
      },
    })
  })
  const [, rerender] = useReducer(() => ({}), {})

  // Callback ref to measure when element mounts
  const setScrollElementRef = useCallback((element: HTMLDivElement | null) => {
    if (!element) return
    if (virtualizer) {
      virtualizer.init(element)
      isInitializedRef.current = true
      rerender()
      return () => virtualizer.destroy()
    }
  }, [])

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <main className="list-virtualizer">
      <div style={{ padding: "20px" }}>
        <h1>List Virtualizer Example</h1>
        <p>Scrolling through {items.length.toLocaleString()} items efficiently</p>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, userSelect: "none" }}>
          <input type="checkbox" checked={isSmooth} onChange={(e) => setIsSmooth(e.currentTarget.checked)} />
          Smooth scroll
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <button
            type="button"
            onClick={() => virtualizer?.scrollToIndex(0, { smooth: isSmooth })}
            disabled={!isInitializedRef.current}
          >
            Scroll to Top
          </button>
          <button
            type="button"
            onClick={() =>
              virtualizer?.scrollToIndex(Math.floor(items.length / 2), { align: "center", smooth: isSmooth })
            }
            disabled={!isInitializedRef.current}
          >
            Scroll to Middle
          </button>
          <button
            type="button"
            onClick={() => virtualizer?.scrollToIndex(items.length - 1, { smooth: isSmooth })}
            disabled={!isInitializedRef.current}
          >
            Scroll to Bottom
          </button>
        </div>

        <div
          ref={setScrollElementRef}
          onScroll={(e) => {
            flushSync(() => {
              virtualizer.handleScroll(e)
            })
          }}
          {...virtualizer.getContainerAriaAttrs()}
          style={{
            ...virtualizer.getContainerStyle(),
            height: "400px",
            border: "1px solid #ccc",
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
                  {...virtualizer.getItemAriaAttrs(virtualItem.index)}
                  style={{
                    ...style,
                    padding: "16px",
                    backgroundColor: virtualItem.index % 2 === 0 ? "#f8f9fa" : "#ffffff",
                    borderBottom: "1px solid #e1e5e9",
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
