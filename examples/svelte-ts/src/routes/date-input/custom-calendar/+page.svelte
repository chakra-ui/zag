<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { PersianCalendar } from "@internationalized/date"
  import * as dateInput from "@zag-js/date-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-input.css"

  function createCalendar(identifier: string) {
    switch (identifier) {
      case "persian":
        return new PersianCalendar()
      default:
        throw new Error(`Unsupported calendar: ${identifier}`)
    }
  }

  const id = $props.id()
  const service = useMachine(dateInput.machine, {
    id,
    locale: "fa-IR",
    createCalendar,
  })

  const api = $derived(dateInput.connect(service, normalizeProps))
</script>

<main class="date-input">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>تاریخ</label>

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
  </output>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
