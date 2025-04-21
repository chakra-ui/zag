<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as progress from "@zag-js/progress"
  import { progressControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(progressControls)

  const id = $props.id()
  const service = useMachine(progress.machine, { id })

  const api = $derived(progress.connect(service, normalizeProps))
</script>

<main class="progress">
  <div {...api.getRootProps()}>
    <div {...api.getLabelProps()}>Upload progress</div>

    <svg {...api.getCircleProps()}>
      <circle {...api.getCircleTrackProps()} />
      <circle {...api.getCircleRangeProps()} />
    </svg>

    <div {...api.getTrackProps()}>
      <div {...api.getRangeProps()}></div>
    </div>

    <div {...api.getValueTextProps()}>{api.valueAsString}</div>

    <div>
      <button onclick={() => api.setValue((api.value ?? 0) - 20)}>Decrease</button>
      <button onclick={() => api.setValue((api.value ?? 0) + 20)}>Increase</button>
      <button onclick={() => api.setValue(null)}>Indeterminate</button>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
