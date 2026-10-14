<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as progress from "@zag-js/progress"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/progress.css"

  const id = $props.id()
  const service = useMachine(progress.machine, {
    id,
    defaultValue: 40,
  })

  const api = $derived(progress.connect(service, normalizeProps))
</script>

<main class="progress">
  <div class="vstack gap-4">
    <div {...api.getRootProps()}>
      <span {...api.getLabelProps()}>Syncing</span>
      <div class="progress-circle-wrap">
        <svg {...api.getCircleProps()}>
          <circle {...api.getCircleTrackProps()} />
          <circle {...api.getCircleRangeProps()} />
        </svg>
        <span {...api.getValueTextProps()}>{api.percentAsString}</span>
      </div>
    </div>

    <div class="hstack">
      <button onclick={() => api.setValue((api.value ?? 0) - 20)}>Decrease</button>
      <button onclick={() => api.setValue((api.value ?? 0) + 20)}>Increase</button>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
