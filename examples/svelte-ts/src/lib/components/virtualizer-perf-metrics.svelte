<script lang="ts">
  import type { ScrollBenchmarkMetrics } from "#lib/scroll-benchmark.ts"
  import type { Snippet } from "svelte"

  interface Props {
    label: string
    metrics: ScrollBenchmarkMetrics | null
    children?: Snippet
  }

  const { label, metrics, children }: Props = $props()
</script>

{#if metrics}
  <div style="padding: 16px; background-color: #f1f5f9; border-radius: 8px; font-size: 14px; font-family: monospace">
    <strong>{label}</strong> ({metrics.scrollCount} scrolls)
    <div style="margin-top: 8px; display: grid; gap: 4px">
      <div>Total time: {metrics.totalTime}ms</div>
      <div>Avg frame: {metrics.avgFrameTime}ms</div>
      <div>Min frame: {metrics.minFrameTime}ms</div>
      <div>Max frame: {metrics.maxFrameTime}ms</div>
      <div style="color: {metrics.droppedFrames > 10 ? '#dc2626' : '#16a34a'}">
        Dropped frames (&gt;16.67ms): {metrics.droppedFrames} / {metrics.scrollCount}
      </div>
      {@render children?.()}
    </div>
  </div>
{/if}
