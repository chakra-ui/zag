<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as meter from "@zag-js/meter"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/meter.css"

  const CAPACITY = 512
  const BACKUPS = 128
  const PHOTOS = 128

  const id = $props.id()
  let used = $state(384)
  let backupsDeleted = $state(false)

  const service = useMachine(meter.machine, (): meter.Props => ({
    id,
    value: used,
    max: CAPACITY,
    low: 300,
    high: 450,
    optimum: 0,
    formatOptions: { style: "unit", unit: "gigabyte", maximumFractionDigits: 0 },
    translations: {
      value: ({ value, max, formatter }) => `${formatter.format(value)} of ${formatter.format(max)}`,
    },
  }))
  const api = $derived(meter.connect(service, normalizeProps))
</script>

<main>
  <div class="meter-storage-quota">
    <div {...api.getRootProps()}>
      <div class="header">
        <span {...api.getLabelProps()}>Storage used</span>
        <span {...api.getValueTextProps()}>{api.valueAsString}</span>
      </div>
      <div {...api.getTrackProps()}>
        <div {...api.getIndicatorProps()}></div>
      </div>
    </div>
    {#if api.valueState === "least-optimal"}
      <p class="alert" role="alert">Storage is full. New files won't sync.</p>
    {/if}
    <div class="meter-actions">
      <button
        type="button"
        disabled={backupsDeleted}
        onclick={() => {
          backupsDeleted = true
          used -= BACKUPS
        }}
      >
        Delete old backups ({BACKUPS} GB)
      </button>
      <button type="button" disabled={used + PHOTOS > CAPACITY} onclick={() => (used += PHOTOS)}>
        Upload photo library ({PHOTOS} GB)
      </button>
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
