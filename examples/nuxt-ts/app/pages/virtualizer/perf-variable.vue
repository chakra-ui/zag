<script setup lang="ts">
import { runScrollBenchmark, type ScrollBenchmarkMetrics } from "~/composables/useScrollBenchmark"
import { useListVirtualizer } from "~/composables/useVirtualizer"

const ITEM_COUNT = 100_000

// Deterministic pseudo-random heights between 30-150px based on index
function getItemHeight(index: number): number {
  const hash = ((index * 2654435761) >>> 0) % 100
  return 30 + Math.floor((hash / 100) * 120)
}

const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
  height: getItemHeight(i),
  lines: 1 + Math.floor(getItemHeight(i) / 30),
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
    <h1>Variable Heights Perf</h1>
    <p style="color: #64748b">
      {{ ITEM_COUNT.toLocaleString() }} items with <strong>variable heights (30-150px)</strong>, 5 overscan. Each item
      has a deterministic height based on its index. Items use <code>measureElement</code> for dynamic measurement. This
      tests the full scroll + measure + reposition pipeline with variable-size items.
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px">
      <div>
        <h2 style="color: #3b82f6">@zag-js/virtualizer</h2>
        <VirtualizerBenchmarkButtons @run="run" />
        <div
          :ref="setScrollRef"
          tabindex="0"
          aria-label="Zag variable-height performance list"
          style="height: 400px; overflow: auto; border: 2px solid #3b82f6; border-radius: 8px"
          @scroll="virtualizer.handleScroll"
        >
          <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
            <div
              v-for="vi in virtualizer.getVirtualItems()"
              :key="vi.index"
              :ref="(el) => vi.measureElement(el as HTMLElement | null)"
              :style="{
                ...virtualizer.getItemStyle(vi),
                padding: '8px 12px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: vi.index % 2 === 0 ? '#f8fafc' : '#fff',
              }"
            >
              <strong>{{ items[vi.index]!.label }}</strong>
              <span style="color: #6b7280; font-size: 12px"> ({{ items[vi.index]!.height }}px)</span>
              <div v-if="items[vi.index]!.lines > 1" style="color: #9ca3af; font-size: 12px; margin-top: 4px">
                <div v-for="i in items[vi.index]!.lines - 1" :key="i">Line {{ i + 1 }} of content for this item</div>
              </div>
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
