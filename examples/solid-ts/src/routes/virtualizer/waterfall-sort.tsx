import { createSignal, For } from "solid-js"
import { mergeProps } from "@zag-js/solid"
import { useWaterfallVirtualizer } from "../../hooks/use-virtualizer"

interface Card {
  id: number
  height: number
}

const createCards = (from: number, count: number): Card[] =>
  Array.from({ length: count }, (_, index) => {
    const id = from + index
    return { id, height: 80 + ((((id * 53) % 10) + 10) % 10) * 20 }
  })

export default function Page() {
  const [cards, setCards] = createSignal(createCards(0, 600))

  // read the cards once here, where they're tracked; the callbacks close over the plain array
  const { virtualizer, ref } = useWaterfallVirtualizer(() => {
    const list = cards()
    return {
      count: list.length,
      columnCount: 3,
      columnGap: 8,
      rowGap: 8,
      overscan: 4,
      // heights are only known once measured
      estimatedItemSize: 150,
      indexToKey: (index: number) => list[index].id,
    }
  })

  return (
    <main style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => setCards((prev) => [...prev].sort((a, b) => a.height - b.height || a.id - b.id))}>
          Sort by height
        </button>
        <button onClick={() => setCards((prev) => [...createCards(prev[0].id - 20, 20), ...prev])}>Prepend 20</button>
      </div>
      <div
        ref={ref}
        {...mergeProps(() => virtualizer().getRootProps(), {
          style: { height: "450px", width: "480px", border: "1px solid #ccc", "margin-top": "12px" },
        })}
        aria-label="Cards"
      >
        <div {...virtualizer().getContentProps()}>
          <For each={virtualizer().getVirtualItems()}>
            {(item) => {
              const card = () => cards()[item.index]
              return (
                <div {...virtualizer().getItemProps(item)} data-testid="card">
                  <div
                    style={{
                      height: `${card().height}px`,
                      padding: "10px",
                      "border-radius": "8px",
                      background: `hsl(${(card().id * 47) % 360}, 70%, 94%)`,
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      "box-sizing": "border-box",
                      "font-size": "13px",
                    }}
                  >
                    <strong>#{card().id}</strong>
                    <div style={{ color: "#6b7280" }}>{card().height}px</div>
                  </div>
                </div>
              )
            }}
          </For>
        </div>
      </div>
    </main>
  )
}
