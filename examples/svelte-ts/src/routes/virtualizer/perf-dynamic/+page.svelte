<script lang="ts">
  import BenchmarkButtons from "#lib/components/virtualizer-benchmark-buttons.svelte"
  import PerfMetrics from "#lib/components/virtualizer-perf-metrics.svelte"
  import { runScrollBenchmark, type ScrollBenchmarkMetrics } from "#lib/scroll-benchmark.ts"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { mergeProps } from "@zag-js/svelte"

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

  const id = $props.id()
  const vz = useListVirtualizer({
    id,
    count: ITEM_COUNT,
    estimatedItemSize: getItemHeight,
    overscan: 5,
  })

  const setScrollRef = (el: HTMLElement) => {
    scrollEl = el
    vz.init(el)
  }

  const run = (scrollCount: number) => {
    if (scrollEl) runScrollBenchmark(scrollEl, scrollCount, (m) => (metrics = m))
  }
</script>

<main style="padding: 20px; max-width: 1200px; margin: 0 auto">
  <h1>Variable Heights Perf (Known Sizes)</h1>
  <p style="color: #64748b">
    {ITEM_COUNT.toLocaleString()} items with <strong>known variable heights (25-125px)</strong>. Uses
    <code>estimatedItemSize: (i) =&gt; getItemHeight(i)</code> — exact per-item estimates, so measuring only confirms them.
    Tests scroll + range-finding perf with variable-size prefix sums.
  </p>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px">
    <div>
      <h2 style="color: #3b82f6">@zag-js/virtualizer</h2>
      <BenchmarkButtons counts={[200, 500, 1000]} onrun={run} />
      <div
        {@attach setScrollRef}
        aria-label="Zag known-size performance list"
        {...mergeProps(vz.virtualizer.getRootProps(), {
          style: { height: "400px", border: "2px solid #3b82f6", borderRadius: "8px" },
        })}
      >
        <div {...vz.virtualizer.getContentProps()}>
          {#each vz.virtualizer.getVirtualItems() as vi (vi.key)}
            <div
              {...mergeProps(vz.virtualizer.getItemProps(vi), {
                style: {
                  height: `${items[vi.index].height}px`,
                  padding: "8px 12px",
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: vi.index % 2 === 0 ? "#f8fafc" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  boxSizing: "border-box",
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
        Rendered: {vz.virtualizer.getVirtualItems().length} items
      </p>
    </div>
    <PerfMetrics label="@zag-js/virtualizer" {metrics} />
  </div>
</main>
