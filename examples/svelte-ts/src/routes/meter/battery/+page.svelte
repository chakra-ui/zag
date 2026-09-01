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
      defaultValue: 40,
      low: 20,
      high: 80,
      optimum: 90,
    }),
  )

  const api = $derived(meter.connect(service, normalizeProps))

  const presets = [
    { value: 10, label: "10%" },
    { value: 50, label: "50%" },
    { value: 90, label: "90%" },
  ]
</script>

<main class="meter">
  <div {...api.getRootProps()}>
    <div style="display: flex; justify-content: space-between; align-items: baseline">
      <span {...api.getLabelProps()}>Battery</span>
      <span {...api.getValueTextProps()}>{api.valueAsString} · {api.valueState}</span>
    </div>
    <div {...api.getTrackProps()}>
      <div {...api.getIndicatorProps()}></div>
    </div>
  </div>

  <p>
    Optimum is above <code>high</code>, so a larger value is better. 90 is optimal, 50 is suboptimal, 10 is
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
