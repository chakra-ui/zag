<script lang="ts">
  import BenchmarkButtons from "#lib/components/virtualizer-benchmark-buttons.svelte"
  import PerfMetrics from "#lib/components/virtualizer-perf-metrics.svelte"
  import { runScrollBenchmark, type ScrollBenchmarkMetrics } from "#lib/scroll-benchmark.ts"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { normalizeProps } from "@zag-js/svelte"

  const ITEM_COUNT = 100_000
  const ITEM_HEIGHT = 40

  const estimateSize = () => ITEM_HEIGHT

  const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
    id: `item-${i}`,
    label: `Item ${i + 1}`,
  }))

  let metrics = $state<ScrollBenchmarkMetrics | null>(null)
  let scrollEl: HTMLElement | null = null

  const { virtualizer, init } = useListVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: estimateSize,
    overscan: 5,
  })

  const setScrollRef = (el: HTMLElement) => {
    scrollEl = el
    init(el)
  }

  const run = (scrollCount: number) => {
    if (!scrollEl) return
    runScrollBenchmark(scrollEl, scrollCount, (m) => (metrics = m))
  }
</script>

<main style="padding: 20px; max-width: 1200px; margin: 0 auto">
  <h1>Virtualizer Performance</h1>
  <p style="color: #64748b">
    {ITEM_COUNT.toLocaleString()} items, {ITEM_HEIGHT}px fixed height, 5 overscan. Click a scroll count button to run
    the benchmark.
  </p>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px">
    <div>
      <h2>@zag-js/virtualizer</h2>
      <BenchmarkButtons onrun={run} />
      <div
        {@attach setScrollRef}
        tabindex="0"
        role="region"
        aria-label="Zag virtualizer performance list"
        style="height: 400px; overflow: auto; border: 2px solid #3b82f6; border-radius: 8px"
        onscroll={virtualizer.handleScroll}
      >
        <div style="height: {virtualizer.getTotalSize()}px; width: 100%; position: relative">
          {#each virtualizer.getVirtualItems() as vi (vi.index)}
            <div
              {...normalizeProps.element({
                style: {
                  ...virtualizer.getItemStyle(vi),
                  padding: "8px 12px",
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: vi.index % 2 === 0 ? "#f8fafc" : "#fff",
                },
              })}
            >
              {items[vi.index].label}
            </div>
          {/each}
        </div>
      </div>
      <p style="font-size: 13px; color: #64748b; margin-top: 8px">
        Rendered: {virtualizer.getVirtualItems().length} items
      </p>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px">
    <PerfMetrics label="@zag-js/virtualizer" {metrics} />
  </div>
</main>
