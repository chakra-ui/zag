<script setup lang="ts">
import type { ComponentPublicInstance } from "vue"
import { useWaterfallVirtualizer } from "~/composables/useVirtualizer"

const ITEM_COUNT = 1_000

function getItemHeight(index: number) {
  const hash = ((index * 1103515245 + 12345) >>> 0) % 170
  return 120 + hash
}

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  title: `Card ${index + 1}`,
  subtitle: `Score ${(index * 37) % 100}`,
  height: getItemHeight(index),
}))

const { virtualizer, init } = useWaterfallVirtualizer({
  count: ITEM_COUNT,
  columnCount: 3,
  columnGap: 12,
  rowGap: 12,
  overscan: 6,
  estimatedSize: (index) => getItemHeight(index),
})

const setScrollRef = (element: Element | ComponentPublicInstance | null) => {
  init(element as HTMLElement | null)
}
</script>

<template>
  <main style="padding: 20px; width: 100%; max-width: 960px">
    <h1>Waterfall Virtualizer</h1>
    <p style="color: #64748b">
      Masonry layout with {{ ITEM_COUNT.toLocaleString() }} variable-height cards across {{ virtualizer.getWaterfallState().columnCount }} columns.
    </p>

    <div
      :ref="setScrollRef"
      tabindex="0"
      aria-label="Virtualized waterfall"
      @scroll="virtualizer.handleScroll"
      :style="{
        ...virtualizer.getContainerStyle(),
        width: '100%',
        height: '560px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        marginTop: '16px',
      }"
    >
      <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
        <div
          v-for="virtualItem in virtualizer.getVirtualItems()"
          :key="items[virtualItem.index]?.id"
          :data-index="virtualItem.index"
          :style="{
            ...virtualizer.getItemStyle(virtualItem),
            height: `${items[virtualItem.index]?.height}px`,
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxSizing: 'border-box',
            background:
              'linear-gradient(180deg, rgba(241,245,249,0.7) 0%, rgba(255,255,255,1) 45%, rgba(248,250,252,1) 100%)',
          }"
        >
          <strong style="font-size: 13px">{{ items[virtualItem.index]?.title }}</strong>
          <p style="margin: 4px 0 0; font-size: 12px; color: #64748b">
            {{ items[virtualItem.index]?.subtitle }} · {{ items[virtualItem.index]?.height }}px
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
