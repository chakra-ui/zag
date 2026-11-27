import { mergeProps } from "@zag-js/preact"
import { useState } from "preact/hooks"
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
  const [cards, setCards] = useState(() => createCards(0, 600))

  const { virtualizer, ref } = useWaterfallVirtualizer({
    count: cards.length,
    columnCount: 3,
    columnGap: 8,
    rowGap: 8,
    overscan: 4,
    // heights are only known once measured
    estimatedItemSize: 150,
    indexToKey: (index) => cards[index].id,
  })

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setCards((prev) => [...prev].sort((a, b) => a.height - b.height || a.id - b.id))}>
          Sort by height
        </button>
        <button onClick={() => setCards((prev) => [...createCards(prev[0].id - 20, 20), ...prev])}>Prepend 20</button>
      </div>
      <div
        ref={ref}
        {...mergeProps(virtualizer.getRootProps(), {
          style: { height: 450, width: 480, border: "1px solid #ccc", marginTop: 12 },
        })}
        aria-label="Cards"
      >
        <div {...virtualizer.getContentProps()}>
          {virtualizer.getVirtualItems().map((item) => {
            const card = cards[item.index]
            return (
              <div key={card.id} {...virtualizer.getItemProps(item)} data-testid="card">
                <div
                  style={{
                    height: card.height,
                    padding: 10,
                    borderRadius: 8,
                    background: `hsl(${(card.id * 47) % 360}, 70%, 94%)`,
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxSizing: "border-box",
                    fontSize: 13,
                  }}
                >
                  <strong>#{card.id}</strong>
                  <div style={{ color: "#6b7280" }}>{card.height}px</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
