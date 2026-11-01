<script lang="ts">
  import * as progress from "@zag-js/progress"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/progress.css"

  const id = $props.id()
  const service = useMachine(progress.machine, {
    id,
    max: 12,
    defaultValue: 4,
    translations: {
      value: ({ value, max }) => (value == null ? "Preparing…" : `${value} of ${max} files`),
    },
  })

  const api = $derived(progress.connect(service, normalizeProps))
</script>

<main class="progress">
  <div class="vstack gap-4">
    <div {...api.getRootProps()}>
      <div class="progress-header">
        <span {...api.getLabelProps()}>Copying files</span>
        <span {...api.getValueTextProps()}>{api.valueAsString}</span>
      </div>
      <div {...api.getTrackProps()}>
        <div {...api.getRangeProps()}></div>
      </div>
    </div>

    <div class="hstack">
      <button onclick={() => api.setValue(Math.max(0, (api.value ?? 0) - 1))}>Previous</button>
      <button onclick={() => api.setValue(Math.min(api.max, (api.value ?? 0) + 1))}>Next file</button>
    </div>
  </div>
</main>
