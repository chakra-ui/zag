<script setup lang="ts">
import { useListVirtualizer } from "~/composables/useVirtualizer"

const ITEM_COUNT = 1000
const ITEM_HEIGHT = 40

const estimateSize = () => ITEM_HEIGHT

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  label: `Item ${index + 1}`,
}))

const scrollPaddingStart = ref(64)
const scrollPaddingEnd = ref(64)

const { virtualizer, init } = useListVirtualizer(() => ({
  count: ITEM_COUNT,
  estimatedSize: estimateSize,
  scrollPaddingStart: scrollPaddingStart.value,
  scrollPaddingEnd: scrollPaddingEnd.value,
  overscan: 5,
}))

const updateScrollPadding = (start: number, end: number) => {
  scrollPaddingStart.value = start
  scrollPaddingEnd.value = end
}
</script>

<template>
  <main style="padding: 20px; max-width: 640px; width: 100%">
    <h1>Scroll Padding Example</h1>
    <p style="color: #64748b">
      <code>scrollPaddingStart</code> and <code>scrollPaddingEnd</code> reserve viewport space when scrolling to an
      item. The blue bands show the reserved alignment zones.
    </p>

    <div style="display: flex; gap: 12px; margin-top: 16px; align-items: center; flex-wrap: wrap">
      <label>
        scrollPaddingStart:
        <input
          type="number"
          :value="scrollPaddingStart"
          style="width: 64px"
          @input="updateScrollPadding(Number(($event.target as HTMLInputElement).value), scrollPaddingEnd)"
        />px
      </label>
      <label>
        scrollPaddingEnd:
        <input
          type="number"
          :value="scrollPaddingEnd"
          style="width: 64px"
          @input="updateScrollPadding(scrollPaddingStart, Number(($event.target as HTMLInputElement).value))"
        />px
      </label>
      <button type="button" @click="updateScrollPadding(0, 0)">No padding</button>
      <button type="button" @click="updateScrollPadding(96, 96)">Large padding</button>
    </div>

    <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap">
      <button type="button" @click="virtualizer.scrollToIndex(250, { align: 'start' })">Item 251 start</button>
      <button type="button" @click="virtualizer.scrollToIndex(500, { align: 'center' })">Item 501 center</button>
      <button type="button" @click="virtualizer.scrollToIndex(750, { align: 'end' })">Item 751 end</button>
    </div>

    <div
      :ref="(el) => init(el as HTMLElement)"
      tabindex="0"
      aria-label="Virtualized list with scroll padding"
      :style="{
        height: '400px',
        width: '100%',
        overflow: 'auto',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginTop: '16px',
        boxSizing: 'border-box',
        background: `linear-gradient(to bottom, #dbeafe ${scrollPaddingStart}px, transparent ${scrollPaddingStart}px, transparent calc(100% - ${scrollPaddingEnd}px), #dbeafe calc(100% - ${scrollPaddingEnd}px))`,
      }"
      @scroll="virtualizer.handleScroll"
    >
      <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
        <div
          v-for="virtualItem in virtualizer.getVirtualItems()"
          :key="items[virtualItem.index]!.id"
          :style="{
            ...virtualizer.getItemStyle(virtualItem),
            height: `${ITEM_HEIGHT}px`,
            padding: '0 16px',
            borderBottom: '1px solid #cbd5e1',
            boxSizing: 'border-box',
            backgroundColor: virtualItem.index % 2 === 0 ? 'rgba(248, 250, 252, 0.92)' : 'rgba(226, 232, 240, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }"
        >
          <span>{{ items[virtualItem.index]!.label }}</span>
          <span style="color: #64748b; font-size: 12px">y: {{ virtualItem.start }}px</span>
        </div>
      </div>
    </div>

    <p style="margin-top: 12px; font-size: 13px; color: #64748b">
      Scroll padding: {{ scrollPaddingStart }}px start, {{ scrollPaddingEnd }}px end. Total size stays
      {{ virtualizer.getTotalSize() }}px.
    </p>
  </main>
</template>
