<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as meter from "@zag-js/meter"
  import { meterControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/meter.css"

  const controls = useControls(meterControls)

  const id = $props.id()
  const service = useMachine(
    meter.machine,
    controls.mergeProps<meter.Props>({
      id,
      defaultValue: 70,
      low: 60,
      high: 85,
      optimum: 10,
    }),
  )

  const api = $derived(meter.connect(service, normalizeProps))

  const presets = [
    { value: 10, label: "10%" },
    { value: 70, label: "70%" },
    { value: 95, label: "95%" },
  ]
</script>

<main class="meter">
  <div {...api.getRootProps()}>
    <div style="display: flex; justify-content: space-between; align-items: baseline">
      <span {...api.getLabelProps()}>Storage used</span>
      <span {...api.getValueTextProps()}>{api.valueAsString} · {api.valueState}</span>
    </div>
    <div {...api.getTrackProps()}>
      <div {...api.getIndicatorProps()}></div>
    </div>
  </div>

  <p>
    Optimum is below <code>low</code>, so a smaller value is better. 10 is optimal, 70 is suboptimal, 95 is
    least-optimal.
  </p>

  <div class="meter-actions">
    {#each presets as { value, label } (value)}
      <button data-testid="set-{value}" type="button" onclick={() => api.setValue(value)}>Set {label}</button>
    {/each}
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
