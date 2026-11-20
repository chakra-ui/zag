<script lang="ts">
  import BenchmarkButtons from "#lib/components/virtualizer-benchmark-buttons.svelte"
  import PerfMetrics from "#lib/components/virtualizer-perf-metrics.svelte"
  import { runScrollBenchmark, type ScrollBenchmarkMetrics } from "#lib/scroll-benchmark.ts"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { mergeProps } from "@zag-js/svelte"

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
  <h1>Variable Heights Perf</h1>
  <p style="color: #64748b">
    {ITEM_COUNT.toLocaleString()} items with <strong>variable heights (30-150px)</strong>, 5 overscan. Each item has a
    deterministic height based on its index. Rendered items are measured automatically. This tests the full scroll +
    measure + reposition pipeline with variable-size items.
  </p>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px">
    <div>
      <h2 style="color: #3b82f6">@zag-js/virtualizer</h2>
      <BenchmarkButtons onrun={run} />
      <div
        {@attach setScrollRef}
        aria-label="Zag variable-height performance list"
        {...mergeProps(vz.virtualizer.getRootProps(), {
          style: { height: "400px", border: "2px solid #3b82f6", borderRadius: "8px" },
        })}
      >
        <div {...vz.virtualizer.getContentProps()}>
          {#each vz.virtualizer.getVirtualItems() as vi (vi.key)}
            {@const item = items[vi.index]}
            <div
              {...mergeProps(vz.virtualizer.getItemProps(vi), {
                style: {
                  padding: "8px 12px",
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: vi.index % 2 === 0 ? "#f8fafc" : "#fff",
                },
              })}
            >
              <strong>{item.label}</strong>
              <span style="color: #6b7280; font-size: 12px"> ({item.height}px)</span>
              {#if item.lines > 1}
                <div style="color: #9ca3af; font-size: 12px; margin-top: 4px">
                  {#each Array.from({ length: item.lines - 1 }, (_, i) => i + 1) as i (i)}
                    <div>Line {i + 1} of content for this item</div>
                  {/each}
                </div>
              {/if}
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
