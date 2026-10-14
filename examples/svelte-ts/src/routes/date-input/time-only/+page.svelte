<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { DateFormatter } from "@internationalized/date"
  import * as dateInput from "@zag-js/date-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-input.css"

  const timeFormatter = new DateFormatter("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })

  const id = $props.id()
  const service = useMachine(dateInput.machine, {
    id,
    locale: "en-US",
    granularity: "minute",
    hourCycle: 24,
    formatter: timeFormatter,
  })

  const api = $derived(dateInput.connect(service, normalizeProps))
</script>

<main class="date-input">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Time</label>

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
  </output>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
