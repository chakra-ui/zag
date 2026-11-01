<script lang="ts">
  import PerfMetrics from "#lib/components/virtualizer-perf-metrics.svelte"
  import type { ScrollBenchmarkMetrics } from "#lib/scroll-benchmark.ts"
  import { useWaterfallVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { normalizeProps } from "@zag-js/svelte"

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

  let itemCount = $state<number>(DEFAULT_ITEM_COUNT)
  let columnCount = $state<number>(4)
  let isRunning = $state(false)
  let runStatus = $state("Idle")
  let metrics = $state<Metrics | null>(null)

  const items = $derived(buildItems(itemCount))

  let scrollEl: HTMLElement | null = null

  const { virtualizer, init } = useWaterfallVirtualizer(() => ({
    count: items.length,
    columnCount,
    columnGap: COLUMN_GAP,
    rowGap: ROW_GAP,
    overscan: OVERSCAN,
    estimatedSize: estimateCardSize,
  }))

  const setScrollRef = (el: HTMLElement) => {
    scrollEl = el
    init(el)
  }

  const layout = $derived(virtualizer.getWaterfallState())

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
    metrics = null
    runStatus = "Idle"
  }

  const runBenchmark = async (scrollCount: number) => {
    if (isRunning) return
    isRunning = true
    try {
      runStatus = "Running..."
      metrics = scrollEl
        ? await runScrollBenchmark(scrollEl, scrollCount, getRuntimeStats)
        : createFallbackMetrics(scrollCount, getRuntimeStats())
      runStatus = `Completed ${scrollCount} scrolls`
    } finally {
      isRunning = false
    }
  }

  const getLineWidth = (lineIndex: number, lines: number) => `${55 + ((lineIndex * 17 + lines * 9) % 40)}%`
</script>

<main style="padding: 20px; max-width: 1320px; margin: 0 auto">
  <h1>Waterfall Virtualizer Perf</h1>
  <p style="color: #64748b">
    Benchmark Zag <code>WaterfallVirtualizer</code> using variable-height cards in a masonry/waterfall layout. Benchmarks
    run synchronized scroll loops and report frame timing plus rendered runtime stats.
  </p>

  <div
    style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; padding: 12px; margin-top: 14px; border-radius: 8px; border: 1px solid #e2e8f0; background-color: #f8fafc"
  >
    <label style="display: flex; align-items: center; gap: 6px">
      Items
      <select
        value={itemCount}
        onchange={(e) => {
          itemCount = Number(e.currentTarget.value)
          clearMetrics()
        }}
        style="padding: 4px 6px; border-radius: 4px"
      >
        {#each ITEM_COUNT_OPTIONS as value (value)}
          <option {value}>{value.toLocaleString()}</option>
        {/each}
      </select>
    </label>

    <label style="display: flex; align-items: center; gap: 6px">
      Columns
      <select
        value={columnCount}
        onchange={(e) => {
          columnCount = Number(e.currentTarget.value)
          clearMetrics()
        }}
        style="padding: 4px 6px; border-radius: 4px"
      >
        {#each COLUMN_COUNT_OPTIONS as value (value)}
          <option {value}>{value}</option>
        {/each}
      </select>
    </label>

    {#each BENCHMARK_SCROLLS as scrollCount (scrollCount)}
      <button
        disabled={isRunning}
        style="padding: 6px 12px; border-radius: 4px; cursor: pointer"
        onclick={() => runBenchmark(scrollCount)}
      >
        Run {scrollCount}
      </button>
    {/each}

    <button style="padding: 6px 12px; border-radius: 4px; cursor: pointer" onclick={clearMetrics}>Clear metrics</button>
    <span style="font-size: 13px; color: #475569">{runStatus}</span>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px">
    <section>
      <h2 style="color: #3b82f6">@zag-js/virtualizer — WaterfallVirtualizer</h2>
      <div
        {@attach setScrollRef}
        tabindex="0"
        role="region"
        aria-label="Zag waterfall performance list"
        style="height: {VIEWPORT_HEIGHT}px; overflow: auto; border: 2px solid #3b82f6; border-radius: 8px"
        onscroll={virtualizer.handleScroll}
      >
        <div style="height: {virtualizer.getTotalSize()}px; width: 100%; position: relative">
          {#each virtualizer.getVirtualItems() as vi (items[vi.index]?.id ?? vi.index)}
            {@const item = items[vi.index]}
            {#if item}
              <div
                {@attach (el) => vi.measureElement(el)}
                {...normalizeProps.element({ style: virtualizer.getItemStyle(vi) })}
              >
                <article
                  style="box-sizing: border-box; height: {item.height}px; width: {layout.columnWidth}px; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: linear-gradient(180deg, rgba(241,245,249,0.7) 0%, rgba(255,255,255,1) 45%, rgba(248,250,252,1) 100%)"
                >
                  <strong style="font-size: 13px">{item.title}</strong>
                  <p style="margin: 4px 0 8px; font-size: 12px; color: #64748b">{item.subtitle}</p>
                  <div style="display: grid; gap: 6px">
                    {#each Array.from({ length: item.lines }) as _, lineIndex (lineIndex)}
                      <div
                        style="width: {getLineWidth(
                          lineIndex,
                          item.lines,
                        )}; height: 8px; border-radius: 99px; background-color: #cbd5e1"
                      ></div>
                    {/each}
                  </div>
                </article>
              </div>
            {/if}
          {/each}
        </div>
      </div>
      <p style="font-size: 13px; color: #64748b; margin-top: 8px">
        Rendered: {virtualizer.getVirtualItems().length} items • Columns: {layout.columnCount} • Column width:
        {Math.round(layout.columnWidth)}px
      </p>
    </section>

    <PerfMetrics label="@zag-js/virtualizer" {metrics}>
      {#if metrics}
        <div>Rendered/visible/overscan: {metrics.renderedCount}/{metrics.visibleCount}/{metrics.overscanCount}</div>
        <div>Total virtual size: {metrics.totalSize}px</div>
      {/if}
    </PerfMetrics>
  </div>
</main>
