<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { parseZonedDateTime } from "@internationalized/date"
  import * as dateInput from "@zag-js/date-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-input.css"

  const timeZone = "America/Los_Angeles"

  let hideTimeZone = $state(false)

  const id = $props.id()
  const service = useMachine(dateInput.machine, () => ({
    id,
    locale: "en-US",
    granularity: "minute" as const,
    timeZone,
    hideTimeZone,
    defaultValue: [parseZonedDateTime("2025-02-03T08:45:00[America/Los_Angeles]")],
  }))

  const api = $derived(dateInput.connect(service, normalizeProps))
</script>

<main class="date-input">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Meeting time</label>

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
    <div>Time zone: {timeZone}</div>
  </output>

  <label>
    <input type="checkbox" data-testid="hide-tz" bind:checked={hideTimeZone} />
    Hide time zone
  </label>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
