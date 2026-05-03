import type { GroupMeta } from "@zag-js/virtualizer"
import { useRef } from "react"
import { useListVirtualizer } from "../../hooks/use-virtualizer"

const ITEMS_PER_GROUP = 50
const GROUP_COUNT = 10
const HEADER_HEIGHT = 32
const ITEM_HEIGHT = 32
const TOTAL_ITEMS = GROUP_COUNT * ITEMS_PER_GROUP

const groups: GroupMeta[] = Array.from({ length: GROUP_COUNT }, (_, i) => ({
  id: `group-${i}`,
  startIndex: i * ITEMS_PER_GROUP,
  headerSize: HEADER_HEIGHT,
}))

const items = Array.from({ length: TOTAL_ITEMS }, (_, i) => {
  const groupIndex = Math.floor(i / ITEMS_PER_GROUP)
  const itemIndex = i % ITEMS_PER_GROUP
  return { id: `item-${i}`, label: `Item ${itemIndex + 1}`, group: `Group ${groupIndex + 1}`, groupIndex }
})

const COLORS = [
  "#fee2e2",
  "#ffedd5",
  "#fef9c3",
  "#dcfce7",
  "#d1fae5",
  "#dbeafe",
  "#e0e7ff",
  "#f3e8ff",
  "#fce7f3",
  "#f5f5f4",
]

const getGroupIndex = (index: number) => Math.floor(index / ITEMS_PER_GROUP)
const getGroupLabel = (index: number) => `Group ${index + 1}`
const isGroupStart = (index: number) => index % ITEMS_PER_GROUP === 0
const getItemSize = (index: number) => ITEM_HEIGHT + (isGroupStart(index) ? HEADER_HEIGHT : 0)

export default function Page() {
  const scrollOffsetRef = useRef(0)

  const { virtualizer, ref } = useListVirtualizer({
    count: TOTAL_ITEMS,
    estimatedSize: getItemSize,
    groups,
    overscan: 5,
  })

  const headerState = virtualizer.getGroupHeaderState(scrollOffsetRef.current, HEADER_HEIGHT)
  const virtualItems = virtualizer.getVirtualItems()

  return (
    <main style={{ padding: 20, maxWidth: 600, width: "100%" }}>
      <h1>Sticky Headers</h1>
      <p style={{ color: "#64748b", fontSize: 14 }}>
        {GROUP_COUNT} groups, {ITEMS_PER_GROUP} items each. Headers stick and push off on scroll.
      </p>

      <div style={{ position: "relative", marginTop: 16, width: "100%" }}>
        {headerState && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: HEADER_HEIGHT,
              zIndex: 10,
              transform: `translateY(${headerState.translateY}px)`,
              backgroundColor: COLORS[getGroupIndex(headerState.group.startIndex)] || "#e2e8f0",
              borderBottom: "2px solid #94a3b8",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              fontWeight: 700,
              fontSize: 13,
              boxSizing: "border-box",
            }}
          >
            {getGroupLabel(getGroupIndex(headerState.group.startIndex))}
          </div>
        )}

        <div
          ref={ref}
          onScroll={(e) => {
            scrollOffsetRef.current = (e.target as HTMLDivElement).scrollTop
            virtualizer.handleScroll(e)
          }}
          tabIndex={0}
          aria-label="Virtualized list with sticky group headers"
          style={{ height: 400, overflow: "auto", border: "2px solid #cbd5e1", borderRadius: 8 }}
        >
          <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
            {virtualItems.map((vi) => {
              const item = items[vi.index]
              const groupStart = isGroupStart(vi.index)
              return (
                <div
                  key={vi.index}
                  style={{
                    ...virtualizer.getItemStyle(vi),
                    height: vi.size,
                    backgroundColor: COLORS[item.groupIndex],
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                >
                  {groupStart && (
                    <div
                      style={{
                        height: HEADER_HEIGHT,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 12px",
                        fontWeight: 700,
                        borderBottom: "2px solid #94a3b8",
                        boxSizing: "border-box",
                      }}
                    >
                      {item.group}
                    </div>
                  )}
                  <div
                    style={{
                      height: ITEM_HEIGHT,
                      padding: "0 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #cbd5e1",
                      boxSizing: "border-box",
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ color: "#64748b", fontSize: 11 }}>{item.group}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <p style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
        Rendered: {virtualItems.length} of {TOTAL_ITEMS}
        {headerState && ` · ${getGroupLabel(getGroupIndex(headerState.group.startIndex))}`}
      </p>
    </main>
  )
}
