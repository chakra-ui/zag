<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as radio from "@zag-js/radio-group"
  import { timeRanges } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/segmented-control.css"
  import "@styles/radio-group.css"

  let value = $state("week")

  const id = $props.id()
  const service = useMachine(radio.machine, () => ({
    id,
    name: "range",
    orientation: "horizontal" as const,
    value,
    onValueChange: (details: radio.ValueChangeDetails) => {
      if (details.value) value = details.value
    },
  }))

  const api = $derived(radio.connect(service, normalizeProps))
  const range = $derived(timeRanges.find((r) => r.id === value)!)
  const max = $derived(Math.max(...range.bars))
</script>

<main>
  <div class="segmented-control time-range">
    <p class="hint">Switch the range to redraw the chart, or jump to Year with the button.</p>
    <div {...api.getRootProps()}>
      <span {...api.getLabelProps()}>Time range</span>
      <div {...api.getIndicatorProps()}></div>
      {#each timeRanges as opt (opt.id)}
        <label {...api.getItemProps({ value: opt.id })}>
          <span {...api.getItemTextProps({ value: opt.id })}>{opt.label}</span>
          <input {...api.getItemHiddenInputProps({ value: opt.id })} />
        </label>
      {/each}
    </div>
    <div class="chart">
      {#each range.bars as bar, i (i)}
        <div class="bar" style:height={`${(bar / max) * 100}%`}></div>
      {/each}
    </div>
    <p class="caption" role="status">{range.caption}</p>
    <div class="actions">
      <button type="button" onclick={() => (value = "year")}>Jump to Year</button>
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
