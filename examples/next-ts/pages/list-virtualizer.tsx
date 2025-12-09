import { ListVirtualizer } from "@zag-js/virtualizer"
import { useLayoutEffect, useReducer, useRef, useState } from "react"
import { flushSync } from "react-dom"

const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}. It contains some sample text to demonstrate variable content length.`,
    value: Math.floor(Math.random() * 1000),
  }))

export default function Page() {
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const [items] = useState(() => generateItems(10000)) // Back to 10k items
  const [virtualizer, setVirtualizer] = useState<ListVirtualizer | null>(null)
  // Use useReducer like TanStack Virtual for stable rerender function
  const rerender = useReducer(() => ({}), {})[1]

  // Initialize virtualizer after DOM is ready
  useLayoutEffect(() => {
    const virtualizer = new ListVirtualizer({
      count: items.length,
      estimatedSize: 80,
      overscan: 5, // TanStack default is 1, but we use 5 for smoother scrolling
      gap: 0,
      paddingStart: 0,
      paddingEnd: 0,
      getContainerEl: () => scrollElementRef.current,
      onRangeChange: () => {
        flushSync(rerender)
      },
    })

    // Set viewport size immediately - this is the key!
    virtualizer.setViewportSize(400)
    virtualizer.setContainerSize(300)

    // Use setTimeout to ensure DOM is ready before force update
    requestAnimationFrame(() => {
      virtualizer.forceUpdate()
    })

    setVirtualizer(virtualizer)

    return () => {
      virtualizer.destroy?.()
    }
  }, [items.length])

  if (!virtualizer) return <div>Loading...</div>

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <main className="list-virtualizer">
      <div style={{ padding: "20px" }}>
        <h1>List Virtualizer Example</h1>
        <p>Scrolling through {items.length.toLocaleString()} items efficiently</p>

        <div
          ref={scrollElementRef}
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
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                  </div>
                  <p>
                    {item.description}{" "}
                    {virtualItem.index % 3 === 0 &&
                      "This item has some extra content to demonstrate dynamic sizing and how the virtualizer handles variable height items efficiently."}
                  </p>
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
