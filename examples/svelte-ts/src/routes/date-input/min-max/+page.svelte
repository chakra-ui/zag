<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { CalendarDate } from "@internationalized/date"
  import * as dateInput from "@zag-js/date-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-input.css"

  const id = $props.id()
  const service = useMachine(dateInput.machine, {
    id,
    min: new CalendarDate(2000, 1, 1),
    max: new CalendarDate(2030, 12, 31),
  })

  const api = $derived(dateInput.connect(service, normalizeProps))
</script>

<main class="date-input">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Date (min: 2000-01-01, max: 2030-12-31)</label>

    <div {...api.getControlProps()}>
      <div {...api.getSegmentGroupProps()}>
        {#each api.getSegments() as segment, i (i)}
          <span {...api.getSegmentProps({ segment })}>
            {segment.text}
          </span>
        {/each}
      </div>
    </div>

    <input {...api.getHiddenInputProps()} />
  </div>

  <output class="date-output">
    <div>Selected: {api.valueAsString.join(", ") || "-"}</div>
    <div>Placeholder: {api.placeholderValue.toString()}</div>
    <div>Editing: {api.displayValues?.[0]?.toString() ?? "-"}</div>
  </output>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
