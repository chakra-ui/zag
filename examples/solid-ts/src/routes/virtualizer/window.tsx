import { mergeProps } from "@zag-js/solid"
import { For } from "solid-js"
import { useWindowVirtualizer } from "../../hooks/use-virtualizer"

const ITEM_COUNT = 10_000

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  name: `Item ${index + 1}`,
}))

export default function Page() {
  const { virtualizer, ref } = useWindowVirtualizer({
    count: ITEM_COUNT,
    estimatedItemSize: 72,
    overscan: 8,
  })

  return (
    <main class="window-list-virtualizer" style={{ padding: "20px", width: "100%", "max-width": "960px" }}>
      <h1>Window Virtualizer</h1>
      <p style={{ color: "#64748b" }}>Uses the page scroll container instead of an explicit scrolling element.</p>

      <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap", "margin-top": "16px" }}>
        <button type="button" onClick={() => virtualizer().scrollToIndex(0, { smooth: true })}>
          Scroll to top
        </button>
        <button
          type="button"
          onClick={() => virtualizer().scrollToIndex(Math.floor(ITEM_COUNT / 2), { align: "center", smooth: true })}
        >
          Scroll to middle
        </button>
        <button type="button" onClick={() => virtualizer().scrollToIndex(ITEM_COUNT - 1, { smooth: true })}>
          Scroll to bottom
        </button>
      </div>

      <div
        ref={ref}
        {...mergeProps(() => virtualizer().getRootProps(), {
          style: {
            width: "100%",
            border: "1px solid #d1d5db",
            "border-radius": "8px",
            "margin-top": "16px",
          },
        })}
      >
        <div {...virtualizer().getContentProps()}>
          <For each={virtualizer().getVirtualItems()}>
            {(virtualItem) => (
              <div
                {...mergeProps(
                  () => virtualizer().getItemProps(virtualItem),
                  () => ({
                    style: {
                      padding: "12px 16px",
                      "border-bottom": "1px solid #e5e7eb",
                      background: virtualItem.index % 2 === 0 ? "#f8fafc" : "#fff",
                    },
                  }),
                )}
              >
                {items[virtualItem.index]?.name}
              </div>
            )}
          </For>
        </div>
      </div>
    </main>
  )
}
