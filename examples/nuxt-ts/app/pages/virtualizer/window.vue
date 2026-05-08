<script setup lang="ts">
import type { ComponentPublicInstance } from "vue"
import { useWindowVirtualizer } from "~/composables/useVirtualizer"

const ITEM_COUNT = 10_000
const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  name: `Item ${index + 1}`,
}))

const { virtualizer, init } = useWindowVirtualizer({
  count: ITEM_COUNT,
  estimatedSize: () => 72,
  overscan: 8,
  initialRect:
    typeof window !== "undefined"
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 0, height: 800 },
})

const setRootRef = (element: Element | ComponentPublicInstance | null) => {
  init(element as HTMLElement | null)
}
</script>

<template>
  <main style="padding: 20px; width: 100%; max-width: 960px">
    <h1>Window Virtualizer</h1>
    <p style="color: #64748b">Uses the page scroll container instead of an explicit scrolling element.</p>

    <div
      :ref="setRootRef"
      v-bind="virtualizer.getContainerAriaAttrs()"
      :style="{ ...virtualizer.getContainerStyle(), width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', marginTop: '16px' }"
    >
      <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
        <div
          v-for="virtualItem in virtualizer.getVirtualItems()"
          :key="items[virtualItem.index]?.id"
          :style="{
            ...virtualizer.getItemStyle(virtualItem),
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            background: virtualItem.index % 2 === 0 ? '#f8fafc' : '#fff',
          }"
        >
          {{ items[virtualItem.index]?.name }}
        </div>
      </div>
    </div>
  </main>
</template>
