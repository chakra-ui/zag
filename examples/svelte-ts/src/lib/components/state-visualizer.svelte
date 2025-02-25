<script lang="ts" generics="T extends MachineSchema">
  import { highlightState } from "@zag-js/stringify-state"
  import type { MachineSchema, Service } from "@zag-js/core"

  interface StateVisualizerProps<T extends MachineSchema> {
    state: Service<T>
    label?: string
    omit?: string[]
    context?: Array<keyof T["context"]>
  }

  const { label, state: currentState, omit, context }: StateVisualizerProps<T> = $props()

  const obj = $derived.by(() => {
    return {
      state: currentState.state.get(),
      event: currentState.event.current(),
      context: context ? Object.fromEntries(context.map((key) => [key, currentState.context.get(key)])) : undefined,
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
