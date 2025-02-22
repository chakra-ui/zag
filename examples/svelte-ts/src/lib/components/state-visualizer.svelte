<script lang="ts">
  import { highlightState } from "@zag-js/stringify-state"
  import type { Service } from "@zag-js/core"

  interface StateVisualizerProps {
    state: Service<any>
    label?: string
    omit?: string[]
  }

  const { label, state: currentState, omit }: StateVisualizerProps = $props()

  const obj = $derived.by(() => {
    return {
      state: currentState.state.get(),
      event: currentState.event.current(),
    }
  })
</script>

<div class="viz">
  <pre>
    <details open>
        <summary>{label || "Visualizer"}</summary>
        <div>{@html highlightState(obj, omit)}</div>
    </details>
  </pre>
</div>
