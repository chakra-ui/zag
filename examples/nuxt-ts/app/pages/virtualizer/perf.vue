<script setup lang="ts">
import { runScrollBenchmark, type ScrollBenchmarkMetrics } from "~/composables/useScrollBenchmark"
import { useListVirtualizer } from "~/composables/useVirtualizer"

const ITEM_COUNT = 100_000
const ITEM_HEIGHT = 40

const estimateSize = () => ITEM_HEIGHT

const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
}))

const metrics = ref<ScrollBenchmarkMetrics | null>(null)
let scrollEl: HTMLElement | null = null

const { virtualizer, init } = useListVirtualizer(() => ({
  count: ITEM_COUNT,
  estimatedSize: estimateSize,
  overscan: 5,
}))

const setScrollRef = (el: unknown) => {
  scrollEl = el as HTMLElement | null
  init(scrollEl)
}

const run = (scrollCount: number) => {
  if (!scrollEl) return
  runScrollBenchmark(scrollEl, scrollCount, (m) => (metrics.value = m))
}
</script>

<template>
  <main style="padding: 20px; max-width: 1200px; margin: 0 auto">
    <h1>Virtualizer Performance</h1>
    <p style="color: #64748b">
      {{ ITEM_COUNT.toLocaleString() }} items, {{ ITEM_HEIGHT }}px fixed height, 5 overscan. Click a scroll count button
      to run the benchmark.
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px">
      <div>
        <h2>@zag-js/virtualizer</h2>
        <VirtualizerBenchmarkButtons @run="run" />
        <div
          :ref="setScrollRef"
          tabindex="0"
          aria-label="Zag virtualizer performance list"
          style="height: 400px; overflow: auto; border: 2px solid #3b82f6; border-radius: 8px"
          @scroll="virtualizer.handleScroll"
        >
          <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
            <div
              v-for="vi in virtualizer.getVirtualItems()"
              :key="vi.index"
              :style="{
                ...virtualizer.getItemStyle(vi),
                padding: '8px 12px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: vi.index % 2 === 0 ? '#f8fafc' : '#fff',
              }"
            >
              {{ items[vi.index]!.label }}
            </div>
          </div>
        </div>
        <p style="font-size: 13px; color: #64748b; margin-top: 8px">
          Rendered: {{ virtualizer.getVirtualItems().length }} items
        </p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px">
      <VirtualizerPerfMetrics label="@zag-js/virtualizer" :metrics="metrics" />
    </div>
  </main>
</template>
