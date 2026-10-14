<script setup lang="ts">
import { mergeProps } from "@zag-js/vue"
import { useListVirtualizer } from "~/composables/useVirtualizer"

const TOTAL_ITEMS = 1000
const PAGE_SIZE = 50
const ROW_HEIGHT = 56

const allItems = Array.from({ length: TOTAL_ITEMS }, (_, index) => ({
  id: `item-${index}`,
  title: `Issue ${index + 1}`,
  status: index % 3 === 0 ? "Triaged" : index % 3 === 1 ? "In progress" : "Backlog",
}))

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const loadedCount = ref(PAGE_SIZE)
const items = computed(() => allItems.slice(0, loadedCount.value))

let scroller: HTMLElement | null = null
const { virtualizer, init } = useListVirtualizer(() => ({
  count: items.value.length,
  estimatedSize: () => ROW_HEIGHT,
  overscan: 4,
}))
const setScroller = (el: unknown) => {
  scroller = el as HTMLElement | null
  init(scroller)
}

const api = useInfiniteScroll(() => ({
  count: items.value.length,
  hasMore: loadedCount.value < TOTAL_ITEMS,
  scrollEl: () => scroller,
  // The returned promise drives the loading state
  async onLoadMore() {
    await wait(500)
    loadedCount.value = Math.min(loadedCount.value + PAGE_SIZE, TOTAL_ITEMS)
  },
}))
const sentinelProps = computed(() => mergeProps(api.value.getSentinelProps(), { style: { height: "1px" } }))
</script>

<template>
  <main style="padding: 20px; max-width: 720px; width: 100%">
    <h1>Infinite Scroll + Virtualized</h1>
    <p style="color: #64748b; font-size: 14px">
      Loaded {{ items.length }} of {{ TOTAL_ITEMS }} rows. The infinite-scroll sentinel sits after the virtual rows, so
      it is always mounted.
    </p>

    <div
      :ref="setScroller"
      tabindex="0"
      aria-label="Virtualized infinite list"
      style="
        height: 420px;
        width: 100%;
        overflow: auto;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        margin-top: 16px;
        box-sizing: border-box;
      "
      @scroll="virtualizer.handleScroll"
    >
      <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
        <template v-for="virtualItem in virtualizer.getVirtualItems()" :key="virtualItem.index">
          <div
            v-if="items[virtualItem.index]"
            :style="{
              ...virtualizer.getItemStyle(virtualItem),
              height: `${virtualItem.size}px`,
              padding: '0 16px',
              borderBottom: '1px solid #e2e8f0',
              boxSizing: 'border-box',
              background: virtualItem.index % 2 === 0 ? '#ffffff' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }"
          >
            <strong>{{ items[virtualItem.index]!.title }}</strong>
            <span style="color: #64748b; font-size: 13px">{{ items[virtualItem.index]!.status }}</span>
          </div>
        </template>
      </div>

      <div v-bind="sentinelProps" />
      <div v-bind="api.getIndicatorProps({ type: 'loading' })" style="padding: 12px; color: #64748b">Loading more…</div>
      <div v-bind="api.getIndicatorProps({ type: 'complete' })" style="padding: 12px; color: #64748b">
        You're all caught up
      </div>
    </div>

    <p style="margin-top: 12px; font-size: 13px; color: #64748b">
      Rendered: {{ virtualizer.getVirtualItems().length }} rows
      {{ loadedCount < TOTAL_ITEMS ? ` · Next page starts at ${items.length + 1}` : " · Complete" }}
    </p>
  </main>
</template>
