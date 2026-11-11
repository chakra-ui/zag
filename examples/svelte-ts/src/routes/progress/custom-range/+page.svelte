<script lang="ts">
  import * as progress from "@zag-js/progress"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/progress.css"

  const id = $props.id()
  const service = useMachine(progress.machine, {
    id,
    min: -20,
    max: 40,
    defaultValue: 10,
    formatOptions: { style: "unit", unit: "celsius" },
  })

  const api = $derived(progress.connect(service, normalizeProps))

  const syncService = useMachine(progress.machine, { id: `${id}-sync`, defaultValue: 60 })
  const sync = $derived(progress.connect(syncService, normalizeProps))
</script>

<main class="progress">
  <div class="vstack gap-4">
    <div {...api.getRootProps()}>
      <div class="progress-header">
        <span {...api.getLabelProps()}>Temperature</span>
        <span {...api.getValueTextProps()}>{api.valueAsString}</span>
      </div>
      <div {...api.getTrackProps()}>
        <div {...api.getRangeProps()}></div>
      </div>
    </div>

    <div class="hstack">
      <button onclick={() => api.setValue(-30)}>Set -30</button>
      <button onclick={() => api.setValue(25)}>Set 25</button>
      <button onclick={() => api.setValue(50)}>Set 50</button>
    </div>

    <div {...sync.getRootProps()}>
      <div {...sync.getTrackProps()} aria-label="Syncing">
        <div {...sync.getRangeProps()}></div>
      </div>
    </div>
  </div>
</main>
