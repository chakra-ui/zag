<script lang="ts">
  import BenchmarkButtons from "$lib/components/virtualizer-benchmark-buttons.svelte"
  import PerfMetrics from "$lib/components/virtualizer-perf-metrics.svelte"
  import { runScrollBenchmark, type ScrollBenchmarkMetrics } from "$lib/scroll-benchmark"
  import { useListVirtualizer } from "$lib/use-virtualizer.svelte"
  import { normalizeProps } from "@zag-js/svelte"

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

  let metrics = $state<ScrollBenchmarkMetrics | null>(null)
  let scrollEl: HTMLElement | null = null

  const { virtualizer, init } = useListVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: getItemHeight,
    overscan: 5,
  })

  const setScrollRef = (el: HTMLElement) => {
    scrollEl = el
    init(el)
  }

  const run = (scrollCount: number) => {
    if (scrollEl) runScrollBenchmark(scrollEl, scrollCount, (m) => (metrics = m))
  }
</script>

<main style="padding: 20px; max-width: 1200px; margin: 0 auto">
  <h1>Variable Heights Perf (Known Sizes)</h1>
  <p style="color: #64748b">
    {ITEM_COUNT.toLocaleString()} items with <strong>known variable heights (25-125px)</strong>. Uses
    <code>estimatedSize: (i) =&gt; getItemHeight(i)</code> — exact per-item size upfront, no measureElement. Tests pure scroll
    + range-finding perf with variable-size prefix sums.
  </p>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px">
    <div>
      <h2 style="color: #3b82f6">@zag-js/virtualizer</h2>
      <BenchmarkButtons counts={[200, 500, 1000]} onrun={run} />
      <div
        {@attach setScrollRef}
        tabindex="0"
        role="region"
        aria-label="Zag known-size performance list"
        style="height: 400px; overflow: auto; border: 2px solid #3b82f6; border-radius: 8px"
        onscroll={virtualizer.handleScroll}
      >
        <div style="height: {virtualizer.getTotalSize()}px; width: 100%; position: relative">
          {#each virtualizer.getVirtualItems() as vi (vi.index)}
            <div
              {...normalizeProps.element({
                style: {
                  ...virtualizer.getItemStyle(vi),
                  height: `${items[vi.index].height}px`,
                  padding: "8px 12px",
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: vi.index % 2 === 0 ? "#f8fafc" : "#fff",
                  display: "flex",
                  alignItems: "center",
                },
              })}
            >
              {items[vi.index].label}
              <span style="color: #9ca3af; font-size: 12px; margin-left: 8px">({items[vi.index].height}px)</span>
            </div>
          {/each}
        </div>
      </div>
      <p style="font-size: 13px; color: #64748b; margin-top: 8px">
        Rendered: {virtualizer.getVirtualItems().length} items
      </p>
    </div>
    <PerfMetrics label="@zag-js/virtualizer" {metrics} />
  </div>
</main>
