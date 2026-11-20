<script lang="ts">
  import BenchmarkButtons from "#lib/components/virtualizer-benchmark-buttons.svelte"
  import PerfMetrics from "#lib/components/virtualizer-perf-metrics.svelte"
  import { runScrollBenchmark, type ScrollBenchmarkMetrics } from "#lib/scroll-benchmark.ts"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { mergeProps } from "@zag-js/svelte"

  const ITEM_COUNT = 100_000
  const ITEM_HEIGHT = 40

  const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
    id: `item-${i}`,
    label: `Item ${i + 1}`,
  }))

  let metrics = $state<ScrollBenchmarkMetrics | null>(null)
  let scrollEl: HTMLElement | null = null

  const id = $props.id()
  const vz = useListVirtualizer({
    id,
    count: ITEM_COUNT,
    itemSize: ITEM_HEIGHT,
    overscan: 5,
  })

  const setScrollRef = (el: HTMLElement) => {
    scrollEl = el
    vz.init(el)
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
        aria-label="Zag virtualizer performance list"
        {...mergeProps(vz.virtualizer.getRootProps(), {
          style: { height: "400px", border: "2px solid #3b82f6", borderRadius: "8px" },
        })}
      >
        <div {...vz.virtualizer.getContentProps()}>
          {#each vz.virtualizer.getVirtualItems() as vi (vi.key)}
            <div
              {...mergeProps(vz.virtualizer.getItemProps(vi), {
                style: {
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
        Rendered: {vz.virtualizer.getVirtualItems().length} items
      </p>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px">
    <PerfMetrics label="@zag-js/virtualizer" {metrics} />
  </div>
</main>
