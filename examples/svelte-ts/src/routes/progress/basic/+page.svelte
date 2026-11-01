<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as progress from "@zag-js/progress"
  import { progressControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/progress.css"

  const controls = useControls(progressControls)

  const id = $props.id()
  const service = useMachine(progress.machine, controls.mergeProps<progress.Props>({ id }))

  const api = $derived(progress.connect(service, normalizeProps))
</script>

<main class="progress">
  <div class="vstack gap-4">
    <div {...api.getRootProps()}>
      <div class="progress-header">
        <span {...api.getLabelProps()}>Upload progress</span>
        <span {...api.getValueTextProps()}>{api.valueAsString}</span>
      </div>
      <div {...api.getTrackProps()}>
        <div {...api.getRangeProps()}></div>
      </div>
    </div>

    <div class="hstack">
      <button onclick={() => api.setValue((api.value ?? 0) - 20)}>Decrease</button>
      <button onclick={() => api.setValue((api.value ?? 0) + 20)}>Increase</button>
      <button onclick={() => api.setValue(null)}>Indeterminate</button>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
