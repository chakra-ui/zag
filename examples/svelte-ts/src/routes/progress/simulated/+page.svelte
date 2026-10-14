<script lang="ts">
  import * as progress from "@zag-js/progress"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/progress.css"

  let running = $state(false)

  const id = $props.id()
  const service = useMachine(progress.machine, {
    id,
    defaultValue: 0,
  })

  const api = $derived(progress.connect(service, normalizeProps))

  $effect(() => {
    if (!running) return
    const id = setInterval(() => {
      const next = Math.min(100, (service.context.get("value") ?? 0) + Math.ceil(Math.random() * 12))
      api.setValue(next)
      if (next === 100) running = false
    }, 300)
    return () => clearInterval(id)
  })
</script>

<main class="progress">
  <div class="vstack gap-4">
    <div {...api.getRootProps()}>
      <div class="progress-header">
        <span {...api.getLabelProps()}>report.pdf</span>
        <span {...api.getValueTextProps()}>{api.valueAsString}</span>
      </div>
      <div {...api.getTrackProps()}>
        <div {...api.getRangeProps()}></div>
      </div>
      <span {...api.getViewProps({ state: "loading" })}>Uploading…</span>
      <span {...api.getViewProps({ state: "complete" })}>Upload complete</span>
    </div>

    <div class="hstack">
      <button
        disabled={running}
        onclick={() => {
          api.setValue(0)
          running = true
        }}
      >
        {api.value === 100 ? "Upload again" : "Start upload"}
      </button>
    </div>
  </div>
</main>
