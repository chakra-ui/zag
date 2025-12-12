import { MasonryVirtualizer } from "@zag-js/virtualizer"
import { useCallback, useLayoutEffect, useMemo, useReducer, useRef } from "react"
import { flushSync } from "react-dom"

type Item = { id: number; title: string; height: number }

const makeItems = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    title: `Card ${i + 1}`,
    height: 80 + ((i * 37) % 220), // deterministic “random” height
  }))

export default function Page() {
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)
  const virtualizerRef = useRef<MasonryVirtualizer | null>(null)
  const [, rerender] = useReducer(() => ({}), {})

  const items = useMemo(() => makeItems(8000), [])

  if (!virtualizerRef.current) {
    virtualizerRef.current = new MasonryVirtualizer({
      count: items.length,
      lanes: 4,
      gap: 12,
      paddingStart: 12,
      paddingEnd: 12,
      estimatedSize: () => 180,
      observeScrollElementSize: true,
      overscan: { count: 16 },
      indexToKey: (index) => items[index]?.id ?? index,
      onRangeChange: () => {
        if (!isInitializedRef.current) return
        flushSync(rerender)
      },
    })
    rerender()
  }

  const virtualizer = virtualizerRef.current

  const setScrollElementRef = useCallback(
    (element: HTMLDivElement | null) => {
      scrollElementRef.current = element
      if (element && virtualizer) {
        virtualizer.init(element)
        isInitializedRef.current = true
        rerender()
      }
    },
    [virtualizer],
  )

  useLayoutEffect(() => {
    const v = virtualizerRef.current
    return () => v?.destroy()
  }, [])

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()
  const range = virtualizer.getRange()

  return (
    <main style={{ padding: 20 }}>
      <h1>Masonry Virtualizer Example</h1>
      <p style={{ color: "#666", marginTop: 4 }}>{items.length.toLocaleString()} items, variable heights, 4 lanes</p>

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
          height: 650,
          width: "100%",
          maxWidth: 1100,
          border: "1px solid #ddd",
          borderRadius: 10,
          marginTop: 16,
          background: "#fff",
        }}
      >
        <div
          style={{
            height: totalSize,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index]
            const style = virtualizer.getItemStyle(virtualItem)
            return (
              <div
                key={virtualItem.key}
                ref={virtualItem.measureElement}
                {...virtualizer.getItemAriaAttrs(virtualItem.index)}
                style={{
                  ...style,
                  boxSizing: "border-box",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  padding: 12,
                  background: `hsl(${(virtualItem.index * 29) % 360} 70% 96%)`,
                }}
              >
                <div style={{ fontWeight: 700 }}>{item?.title ?? "Missing"}</div>
                <div style={{ marginTop: 8, color: "#444" }}>
                  Index: {virtualItem.index} • Start: {Math.round(virtualItem.start)}px • Lane: {virtualItem.lane}
                </div>
                {/* Force variable height content */}
                <div style={{ height: item?.height ?? 140 }} />
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop: 16, color: "#555", fontSize: 14 }}>
        <div>Total items: {items.length.toLocaleString()}</div>
        <div>Rendered items: {virtualItems.length}</div>
        <div>Total height: {Math.round(totalSize)}px</div>
        <div>
          Visible range (index-based): {range.startIndex} - {range.endIndex}
        </div>
      </div>
    </main>
  )
}
