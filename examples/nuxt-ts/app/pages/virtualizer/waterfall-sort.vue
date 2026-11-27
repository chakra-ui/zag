<script setup lang="ts">
import { mergeProps } from "@zag-js/vue"
import { useWaterfallVirtualizer } from "~/composables/useVirtualizer"

interface Card {
  id: number
  height: number
}

const createCards = (from: number, count: number): Card[] =>
  Array.from({ length: count }, (_, index) => {
    const id = from + index
    return { id, height: 80 + ((((id * 53) % 10) + 10) % 10) * 20 }
  })

const cards = ref(createCards(0, 600))

const { virtualizer, ref: rootRef } = useWaterfallVirtualizer(() => ({
  count: cards.value.length,
  columnCount: 3,
  columnGap: 8,
  rowGap: 8,
  overscan: 4,
  // heights are only known once measured
  estimatedItemSize: 150,
  indexToKey: (index: number) => cards.value[index].id,
}))

const sortByHeight = () => (cards.value = [...cards.value].sort((a, b) => a.height - b.height || a.id - b.id))
const prepend = () => (cards.value = [...createCards(cards.value[0].id - 20, 20), ...cards.value])
</script>

<template>
  <main style="padding: 20px">
    <div style="display: flex; gap: 8px">
      <button @click="sortByHeight">Sort by height</button>
      <button @click="prepend">Prepend 20</button>
    </div>
    <div
      :ref="rootRef"
      v-bind="
        mergeProps(virtualizer.getRootProps(), {
          style: { height: '450px', width: '480px', border: '1px solid #ccc', marginTop: '12px' },
        })
      "
      aria-label="Cards"
    >
      <div v-bind="virtualizer.getContentProps()">
        <div
          v-for="item in virtualizer.getVirtualItems()"
          :key="cards[item.index].id"
          v-bind="virtualizer.getItemProps(item)"
          data-testid="card"
        >
          <div
            :style="{
              height: `${cards[item.index].height}px`,
              padding: '10px',
              borderRadius: '8px',
              background: `hsl(${(cards[item.index].id * 47) % 360}, 70%, 94%)`,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxSizing: 'border-box',
              fontSize: '13px',
            }"
          >
            <strong>#{{ cards[item.index].id }}</strong>
            <div style="color: #6b7280">{{ cards[item.index].height }}px</div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
