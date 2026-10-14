<script setup lang="ts">
import { runScrollBenchmark, type ScrollBenchmarkMetrics } from "~/composables/useScrollBenchmark"
import { useListVirtualizer } from "~/composables/useVirtualizer"

const ITEM_COUNT = 100_000

function getItemHeight(index: number): number {
  const hash = ((index * 2654435761) >>> 0) % 100
  return 25 + Math.round((hash / 100) * 100)
}

const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
  height: getItemHeight(i),
}))

const metrics = ref<ScrollBenchmarkMetrics | null>(null)
let scrollEl: HTMLElement | null = null

const { virtualizer, init } = useListVirtualizer(() => ({
  count: ITEM_COUNT,
  estimatedSize: getItemHeight,
  overscan: 5,
}))

const setScrollRef = (el: unknown) => {
  scrollEl = el as HTMLElement | null
  init(scrollEl)
}

const run = (scrollCount: number) => {
  if (scrollEl) runScrollBenchmark(scrollEl, scrollCount, (m) => (metrics.value = m))
}
</script>

<template>
  <main style="padding: 20px; max-width: 1200px; margin: 0 auto">
    <h1>Variable Heights Perf (Known Sizes)</h1>
    <p style="color: #64748b">
      {{ ITEM_COUNT.toLocaleString() }} items with <strong>known variable heights (25-125px)</strong>. Uses
      <code>estimatedSize: (i) =&gt; getItemHeight(i)</code> — exact per-item size upfront, no measureElement. Tests
      pure scroll + range-finding perf with variable-size prefix sums.
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px">
      <div>
        <h2 style="color: #3b82f6">@zag-js/virtualizer</h2>
        <VirtualizerBenchmarkButtons :counts="[200, 500, 1000]" @run="run" />
        <div
          :ref="setScrollRef"
          tabindex="0"
          aria-label="Zag known-size performance list"
          style="height: 400px; overflow: auto; border: 2px solid #3b82f6; border-radius: 8px"
          @scroll="virtualizer.handleScroll"
        >
          <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
            <div
              v-for="vi in virtualizer.getVirtualItems()"
              :key="vi.index"
              :style="{
                ...virtualizer.getItemStyle(vi),
                height: `${items[vi.index]!.height}px`,
                padding: '8px 12px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: vi.index % 2 === 0 ? '#f8fafc' : '#fff',
                display: 'flex',
                alignItems: 'center',
              }"
            >
              {{ items[vi.index]!.label }}
              <span style="color: #9ca3af; font-size: 12px; margin-left: 8px">({{ items[vi.index]!.height }}px)</span>
            </div>
          </div>
        </div>
        <p style="font-size: 13px; color: #64748b; margin-top: 8px">
          Rendered: {{ virtualizer.getVirtualItems().length }} items
        </p>
      </div>
      <VirtualizerPerfMetrics label="@zag-js/virtualizer" :metrics="metrics" />
    </div>
  </main>
</template>
