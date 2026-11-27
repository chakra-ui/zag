<script lang="ts">
  import { useWaterfallVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { mergeProps } from "@zag-js/svelte"

  interface Card {
    id: number
    height: number
  }

  const createCards = (from: number, count: number): Card[] =>
    Array.from({ length: count }, (_, index) => {
      const id = from + index
      return { id, height: 80 + ((((id * 53) % 10) + 10) % 10) * 20 }
    })

  let cards = $state(createCards(0, 600))

  const id = $props.id()
  const vz = useWaterfallVirtualizer(() => ({
    id,
    count: cards.length,
    columnCount: 3,
    columnGap: 8,
    rowGap: 8,
    overscan: 4,
    // heights are only known once measured
    estimatedItemSize: 150,
    indexToKey: (index: number) => cards[index].id,
  }))
</script>

<main style="padding: 20px">
  <div style="display: flex; gap: 8px">
    <button onclick={() => (cards = [...cards].sort((a, b) => a.height - b.height || a.id - b.id))}>
      Sort by height
    </button>
    <button onclick={() => (cards = [...createCards(cards[0].id - 20, 20), ...cards])}>Prepend 20</button>
  </div>
  <div
    {@attach vz.init}
    {...mergeProps(vz.virtualizer.getRootProps(), {
      style: { height: "450px", width: "480px", border: "1px solid #ccc", marginTop: "12px" },
    })}
    aria-label="Cards"
  >
    <div {...vz.virtualizer.getContentProps()}>
      {#each vz.virtualizer.getVirtualItems() as item (cards[item.index].id)}
        {@const card = cards[item.index]}
        <div {...vz.virtualizer.getItemProps(item)} data-testid="card">
          <div
            style="height: {card.height}px; padding: 10px; border-radius: 8px; background: hsl({(card.id * 47) %
              360}, 70%, 94%); border: 1px solid rgba(0, 0, 0, 0.08); box-sizing: border-box; font-size: 13px"
          >
            <strong>#{card.id}</strong>
            <div style="color: #6b7280">{card.height}px</div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</main>
