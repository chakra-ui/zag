<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import type { DateValue } from "@internationalized/date"
  import * as dateInput from "@zag-js/date-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-input.css"

  let value = $state.raw<DateValue[]>([])

  const id = $props.id()
  const service = useMachine(dateInput.machine, () => ({
    id,
    value,
    onValueChange: ({ value: next }) => (value = next),
  }))

  const api = $derived(dateInput.connect(service, normalizeProps))
</script>

<main class="date-input">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Date</label>

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
    <div>Controlled value: {api.valueAsString.join(", ") || "-"}</div>
  </output>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
