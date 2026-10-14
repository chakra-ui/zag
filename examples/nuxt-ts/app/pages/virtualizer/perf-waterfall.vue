<script setup lang="ts">
import type { ScrollBenchmarkMetrics } from "~/composables/useScrollBenchmark"
import { useWaterfallVirtualizer } from "~/composables/useVirtualizer"

const DEFAULT_ITEM_COUNT = 5_000
const OVERSCAN = 6
const VIEWPORT_HEIGHT = 460
const COLUMN_GAP = 12
const ROW_GAP = 12
const ESTIMATED_CARD_HEIGHT = 210

const estimateCardSize = () => ESTIMATED_CARD_HEIGHT

const ITEM_COUNT_OPTIONS = [2_000, 5_000, 10_000] as const
const COLUMN_COUNT_OPTIONS = [2, 3, 4, 5] as const
const BENCHMARK_SCROLLS = [200, 500, 1000] as const

interface WaterfallItem {
  id: string
  title: string
  subtitle: string
  height: number
  lines: number
}

interface RuntimeStats {
  renderedCount: number
  visibleCount: number
  overscanCount: number
  totalSize: number
}

interface Metrics extends ScrollBenchmarkMetrics, RuntimeStats {}

function createFallbackMetrics(scrollCount: number, runtime: RuntimeStats): Metrics {
  return {
    totalTime: 0,
    scrollCount,
    avgFrameTime: 0,
    minFrameTime: 0,
    maxFrameTime: 0,
    droppedFrames: 0,
    ...runtime,
    totalSize: Math.round(runtime.totalSize),
  }
}

function getItemHeight(index: number): number {
  const hash = ((index * 1103515245 + 12345) >>> 0) % 170
  return 120 + hash
}

function buildItems(itemCount: number): WaterfallItem[] {
  return Array.from({ length: itemCount }, (_, index) => ({
    id: `waterfall-item-${index}`,
    title: `Card ${index + 1}`,
    subtitle: `Score ${(index * 37) % 100}`,
    height: getItemHeight(index),
    lines: 2 + (index % 5),
  }))
}

function runScrollBenchmark(scrollEl: HTMLElement, scrollCount: number, getRuntimeStats: () => RuntimeStats) {
  return new Promise<Metrics>((resolve) => {
    const frameTimes: number[] = []
    let lastTime = performance.now()
    let scrollsDone = 0
    const maxScrollable = scrollEl.scrollHeight - scrollEl.clientHeight
    if (maxScrollable <= 0) {
      resolve(createFallbackMetrics(scrollCount, getRuntimeStats()))
      return
    }
    const scrollStep = maxScrollable / scrollCount

    function tick() {
      const now = performance.now()
      frameTimes.push(now - lastTime)
      lastTime = now

      if (scrollsDone < scrollCount) {
        scrollEl.scrollTop = scrollStep * scrollsDone
        scrollsDone++
        requestAnimationFrame(tick)
        return
      }

      scrollEl.scrollTop = 0
      const totalTime = frameTimes.reduce((sum, value) => sum + value, 0)
      const runtime = getRuntimeStats()
      resolve({
        totalTime: Math.round(totalTime),
        scrollCount,
        avgFrameTime: Math.round((totalTime / frameTimes.length) * 100) / 100,
        minFrameTime: Math.round(Math.min(...frameTimes) * 100) / 100,
        maxFrameTime: Math.round(Math.max(...frameTimes) * 100) / 100,
        droppedFrames: frameTimes.filter((time) => time > 16.67).length,
        ...runtime,
        totalSize: Math.round(runtime.totalSize),
      })
    }

    requestAnimationFrame(tick)
  })
}

const itemCount = ref<number>(DEFAULT_ITEM_COUNT)
const columnCount = ref<number>(4)
const isRunning = ref(false)
const runStatus = ref("Idle")
const metrics = ref<Metrics | null>(null)

const items = computed(() => buildItems(itemCount.value))

let scrollEl: HTMLElement | null = null

const { virtualizer, init } = useWaterfallVirtualizer(() => ({
  count: items.value.length,
  columnCount: columnCount.value,
  columnGap: COLUMN_GAP,
  rowGap: ROW_GAP,
  overscan: OVERSCAN,
  estimatedSize: estimateCardSize,
}))

const setScrollRef = (el: unknown) => {
  scrollEl = el as HTMLElement | null
  init(scrollEl)
}

const layout = computed(() => virtualizer.getWaterfallState())

const getRuntimeStats = (): RuntimeStats => {
  const virtualItems = virtualizer.getVirtualItems()
  const visibleCount = virtualItems.filter((item) => item.isVisible).length
  return {
    renderedCount: virtualItems.length,
    visibleCount,
    overscanCount: virtualItems.length - visibleCount,
    totalSize: virtualizer.getTotalSize(),
  }
}

const clearMetrics = () => {
  metrics.value = null
  runStatus.value = "Idle"
}

watch([itemCount, columnCount], clearMetrics)

const runBenchmark = async (scrollCount: number) => {
  if (isRunning.value) return
  isRunning.value = true
  try {
    runStatus.value = "Running..."
    metrics.value = scrollEl
      ? await runScrollBenchmark(scrollEl, scrollCount, getRuntimeStats)
      : createFallbackMetrics(scrollCount, getRuntimeStats())
    runStatus.value = `Completed ${scrollCount} scrolls`
  } finally {
    isRunning.value = false
  }
}

const getLineWidth = (lineIndex: number, lines: number) => `${55 + ((lineIndex * 17 + lines * 9) % 40)}%`
</script>

<template>
  <main style="padding: 20px; max-width: 1320px; margin: 0 auto">
    <h1>Waterfall Virtualizer Perf</h1>
    <p style="color: #64748b">
      Benchmark Zag <code>WaterfallVirtualizer</code> using variable-height cards in a masonry/waterfall layout.
      Benchmarks run synchronized scroll loops and report frame timing plus rendered runtime stats.
    </p>

    <div
      style="
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        padding: 12px;
        margin-top: 14px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background-color: #f8fafc;
      "
    >
      <label style="display: flex; align-items: center; gap: 6px">
        Items
        <select v-model.number="itemCount" style="padding: 4px 6px; border-radius: 4px">
          <option v-for="value in ITEM_COUNT_OPTIONS" :key="value" :value="value">{{ value.toLocaleString() }}</option>
        </select>
      </label>

      <label style="display: flex; align-items: center; gap: 6px">
        Columns
        <select v-model.number="columnCount" style="padding: 4px 6px; border-radius: 4px">
          <option v-for="value in COLUMN_COUNT_OPTIONS" :key="value" :value="value">{{ value }}</option>
        </select>
      </label>

      <button
        v-for="scrollCount in BENCHMARK_SCROLLS"
        :key="scrollCount"
        :disabled="isRunning"
        style="padding: 6px 12px; border-radius: 4px; cursor: pointer"
        @click="runBenchmark(scrollCount)"
      >
        Run {{ scrollCount }}
      </button>

      <button style="padding: 6px 12px; border-radius: 4px; cursor: pointer" @click="clearMetrics">
        Clear metrics
      </button>
      <span style="font-size: 13px; color: #475569">{{ runStatus }}</span>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px">
      <section>
        <h2 style="color: #3b82f6">@zag-js/virtualizer — WaterfallVirtualizer</h2>
        <div
          :ref="setScrollRef"
          tabindex="0"
          aria-label="Zag waterfall performance list"
          :style="{
            height: `${VIEWPORT_HEIGHT}px`,
            overflow: 'auto',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
          }"
          @scroll="virtualizer.handleScroll"
        >
          <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
            <template v-for="vi in virtualizer.getVirtualItems()" :key="items[vi.index]?.id ?? vi.index">
              <div
                v-if="items[vi.index]"
                :ref="(el) => vi.measureElement(el as HTMLElement | null)"
                :style="virtualizer.getItemStyle(vi)"
              >
                <article
                  :style="{
                    boxSizing: 'border-box',
                    height: `${items[vi.index]!.height}px`,
                    width: `${layout.columnWidth}px`,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background:
                      'linear-gradient(180deg, rgba(241,245,249,0.7) 0%, rgba(255,255,255,1) 45%, rgba(248,250,252,1) 100%)',
                  }"
                >
                  <strong style="font-size: 13px">{{ items[vi.index]!.title }}</strong>
                  <p style="margin: 4px 0 8px; font-size: 12px; color: #64748b">{{ items[vi.index]!.subtitle }}</p>
                  <div style="display: grid; gap: 6px">
                    <div
                      v-for="lineIndex in items[vi.index]!.lines"
                      :key="lineIndex"
                      :style="{
                        width: getLineWidth(lineIndex - 1, items[vi.index]!.lines),
                        height: '8px',
                        borderRadius: '99px',
                        backgroundColor: '#cbd5e1',
                      }"
                    />
                  </div>
                </article>
              </div>
            </template>
          </div>
        </div>
        <p style="font-size: 13px; color: #64748b; margin-top: 8px">
          Rendered: {{ virtualizer.getVirtualItems().length }} items • Columns: {{ layout.columnCount }} • Column width:
          {{ Math.round(layout.columnWidth) }}px
        </p>
      </section>

      <VirtualizerPerfMetrics label="@zag-js/virtualizer" :metrics="metrics">
        <template v-if="metrics">
          <div>
            Rendered/visible/overscan: {{ metrics.renderedCount }}/{{ metrics.visibleCount }}/{{
              metrics.overscanCount
            }}
          </div>
          <div>Total virtual size: {{ metrics.totalSize }}px</div>
        </template>
      </VirtualizerPerfMetrics>
    </div>
  </main>
</template>
