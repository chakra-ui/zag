import type { GroupMeta } from "@zag-js/virtualizer"
import { createSignal, Index, Show } from "solid-js"
import { useListVirtualizer } from "~/hooks/use-virtualizer"

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
  const [scrollOffset, setScrollOffset] = createSignal(0)

  const { virtualizer, ref } = useListVirtualizer({
    count: TOTAL_ITEMS,
    estimatedSize: getItemSize,
    groups,
    overscan: 5,
  })

  const headerState = () => virtualizer.getGroupHeaderState(scrollOffset(), HEADER_HEIGHT)

  return (
    <main style={{ padding: "20px", "max-width": "600px", width: "100%" }}>
      <h1>Sticky Headers</h1>
      <p style={{ color: "#64748b", "font-size": "14px" }}>
        {GROUP_COUNT} groups, {ITEMS_PER_GROUP} items each. Headers stick and push off on scroll.
      </p>

      <div style={{ position: "relative", "margin-top": "16px", width: "100%" }}>
        <Show when={headerState()}>
          {(state) => (
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                height: `${HEADER_HEIGHT}px`,
                "z-index": 10,
                transform: `translateY(${state().translateY}px)`,
                "background-color": COLORS[getGroupIndex(state().group.startIndex)] || "#e2e8f0",
                "border-bottom": "2px solid #94a3b8",
                display: "flex",
                "align-items": "center",
                padding: "0 12px",
                "font-weight": 700,
                "font-size": "13px",
                "box-sizing": "border-box",
              }}
            >
              {getGroupLabel(getGroupIndex(state().group.startIndex))}
            </div>
          )}
        </Show>

        <div
          ref={ref}
          onScroll={(e) => {
            setScrollOffset(e.currentTarget.scrollTop)
            virtualizer.handleScroll(e)
          }}
          tabIndex={0}
          aria-label="Virtualized list with sticky group headers"
          style={{ height: "400px", overflow: "auto", border: "2px solid #cbd5e1", "border-radius": "8px" }}
        >
          <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
            <Index each={virtualizer.getVirtualItems()}>
              {(vi) => {
                const item = () => items[vi().index]
                return (
                  <div
                    style={{
                      ...virtualizer.getItemStyle(vi()),
                      height: `${vi().size}px`,
                      "background-color": COLORS[item().groupIndex],
                      "font-size": "13px",
                      "box-sizing": "border-box",
                    }}
                  >
                    <Show when={isGroupStart(vi().index)}>
                      <div
                        style={{
                          height: `${HEADER_HEIGHT}px`,
                          display: "flex",
                          "align-items": "center",
                          padding: "0 12px",
                          "font-weight": 700,
                          "border-bottom": "2px solid #94a3b8",
                          "box-sizing": "border-box",
                        }}
                      >
                        {item().group}
                      </div>
                    </Show>
                    <div
                      style={{
                        height: `${ITEM_HEIGHT}px`,
                        padding: "0 12px",
                        display: "flex",
                        "align-items": "center",
                        "justify-content": "space-between",
                        "border-bottom": "1px solid #cbd5e1",
                        "box-sizing": "border-box",
                      }}
                    >
                      <span>{item().label}</span>
                      <span style={{ color: "#64748b", "font-size": "11px" }}>{item().group}</span>
                    </div>
                  </div>
                )
              }}
            </Index>
          </div>
        </div>
      </div>

      <p style={{ "margin-top": "8px", "font-size": "13px", color: "#64748b" }}>
        Rendered: {virtualizer.getVirtualItems().length} of {TOTAL_ITEMS}
        {headerState() ? ` · ${getGroupLabel(getGroupIndex(headerState()!.group.startIndex))}` : ""}
      </p>
    </main>
  )
}
