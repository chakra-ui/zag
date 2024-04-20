<script lang="ts">
  import { stringifyState } from "@zag-js/shared"

  interface StateVisualizerProps {
    state: Record<string, any>
    label?: string
    omit?: string[]
  }

  const { label, state: currentState, omit }: StateVisualizerProps = $props()
</script>

<div class="viz">
  <pre>
    <details open>
        <summary>{label || "Visualizer"}</summary>
        <div>{@html stringifyState($state.snapshot(currentState), omit)}</div>
    </details>
  </pre>
</div>
