<script lang="ts">
  import BenchmarkButtons from "#lib/components/virtualizer-benchmark-buttons.svelte"
  import PerfMetrics from "#lib/components/virtualizer-perf-metrics.svelte"
  import { runWindowScrollBenchmark, type ScrollBenchmarkMetrics } from "#lib/scroll-benchmark.ts"
  import { useWindowVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { normalizeProps } from "@zag-js/svelte"

  const ITEM_COUNT = 10_000
  const ITEM_HEIGHT = 80

  const estimateSize = () => ITEM_HEIGHT

  const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
    id: `item-${i}`,
    label: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
  }))

  let metrics = $state<ScrollBenchmarkMetrics | null>(null)

  const { virtualizer, init } = useWindowVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: estimateSize,
    overscan: 5,
    initialRect:
      typeof window !== "undefined"
        ? { width: window.innerWidth, height: window.innerHeight }
        : { width: 0, height: 800 },
  })

  const run = (scrollCount: number) => runWindowScrollBenchmark(scrollCount, (m) => (metrics = m))
</script>

<div class="window-list-virtualizer" style="max-width: 960px; margin: 0 auto; padding: 0 20px 80px">
  <div
    style="position: sticky; top: 0; z-index: 100; background-color: #fff; border-bottom: 1px solid #e5e7eb; padding: 16px 0; margin-bottom: 16px"
  >
    <h1 style="margin: 0 0 8px 0; font-size: 22px">Window Virtualizer — Perf</h1>
    <p style="color: #64748b; margin: 0 0 12px 0; font-size: 13px">
      {ITEM_COUNT.toLocaleString()} items, {ITEM_HEIGHT}px estimated height, 5 overscan. Scrolls
      <code>window</code>. Run a benchmark below.
    </p>
    <PerfMetrics label="@zag-js/virtualizer" {metrics} />
  </div>

  <div>
    <h3 style="color: #3b82f6">@zag-js/virtualizer (Window)</h3>
    <BenchmarkButtons onrun={run} />
    <div
      {@attach init}
      {...normalizeProps.element({
        style: {
          ...virtualizer.getContainerStyle(),
          width: "100%",
          border: "2px solid #3b82f6",
          borderRadius: "8px",
        },
      })}
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
            <strong>{items[vi.index].label}</strong>
            <div style="font-size: 12px; color: #64748b">{items[vi.index].description}</div>
          </div>
        {/each}
      </div>
    </div>
    <p style="font-size: 13px; color: #64748b; margin-top: 8px">
      Rendered: {virtualizer.getVirtualItems().length} items
    </p>
  </div>
</div>
