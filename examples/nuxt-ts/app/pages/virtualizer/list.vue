<script setup lang="ts">
import type { ComponentPublicInstance } from "vue"
import { useListVirtualizer } from "~/composables/useVirtualizer"

const ITEM_COUNT = 10_000
const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  name: `Item ${index + 1}`,
  description: `This is the description for item ${index + 1}`,
}))

const smoothScroll = ref(true)

const { virtualizer, init } = useListVirtualizer({
  count: ITEM_COUNT,
  estimatedSize: () => 64,
  overscan: 6,
})

const setScrollRef = (element: Element | ComponentPublicInstance | null) => {
  init(element as HTMLElement | null)
}
</script>

<template>
  <main style="padding: 20px; width: 100%; max-width: 900px">
    <h1>List Virtualizer</h1>
    <p style="color: #64748b">Efficiently render {{ ITEM_COUNT.toLocaleString() }} rows.</p>

    <label style="display: flex; align-items: center; gap: 8px; margin-top: 12px; user-select: none">
      <input v-model="smoothScroll" type="checkbox" />
      Smooth scroll
    </label>

    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px">
      <button type="button" @click="virtualizer.scrollToIndex(0, { smooth: smoothScroll })">Scroll to top</button>
      <button type="button" @click="virtualizer.scrollToIndex(Math.floor(ITEM_COUNT / 2), { align: 'center', smooth: smoothScroll })">
        Scroll to middle
      </button>
      <button type="button" @click="virtualizer.scrollToIndex(ITEM_COUNT - 1, { smooth: smoothScroll })">Scroll to bottom</button>
    </div>

    <div
      :ref="setScrollRef"
      v-bind="virtualizer.getContainerAriaAttrs()"
      tabindex="0"
      aria-label="Virtualized list"
      @scroll="virtualizer.handleScroll"
      :style="{ ...virtualizer.getContainerStyle(), width: '100%', height: '420px', border: '1px solid #d1d5db', borderRadius: '8px', marginTop: '16px' }"
    >
      <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
        <div
          v-for="virtualItem in virtualizer.getVirtualItems()"
          :key="items[virtualItem.index]?.id"
          v-bind="virtualizer.getItemAriaAttrs(virtualItem.index)"
          :style="{
            ...virtualizer.getItemStyle(virtualItem),
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            background: virtualItem.index % 2 === 0 ? '#f8fafc' : '#fff',
          }"
        >
          <strong>{{ items[virtualItem.index]?.name }}</strong>
          <p style="margin: 6px 0 0; color: #64748b">{{ items[virtualItem.index]?.description }}</p>
        </div>
      </div>
    </div>
  </main>
</template>
