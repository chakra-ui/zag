<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as dateInput from "@zag-js/date-input"
  import { dateInputControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-input.css"

  const controls = useControls(dateInputControls)

  const id = $props.id()
  const service = useMachine(
    dateInput.machine,
    controls.mergeProps<dateInput.Props>({
      id,
      selectionMode: "range",
    }),
  )

  const api = $derived(dateInput.connect(service, normalizeProps))
</script>

<main class="date-input">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Date Range</label>

    <div {...api.getControlProps()}>
      <div {...api.getSegmentGroupProps({ index: 0 })}>
        {#each api.getSegments({ index: 0 }) as segment, i (i)}
          <span {...api.getSegmentProps({ segment, index: 0 })}>
            {segment.text}
          </span>
        {/each}
      </div>

      <span> &ndash; </span>

      <div {...api.getSegmentGroupProps({ index: 1 })}>
        {#each api.getSegments({ index: 1 }) as segment, i (i)}
          <span {...api.getSegmentProps({ segment, index: 1 })}>
            {segment.text}
          </span>
        {/each}
      </div>
    </div>

    <input {...api.getHiddenInputProps({ index: 0 })} />
    <input {...api.getHiddenInputProps({ index: 1 })} />
  </div>

  <output class="date-output">
    <div>Selected: {api.valueAsString.join(" - ") || "-"}</div>
    <div>Placeholder: {api.placeholderValue.toString()}</div>
    {#each api.displayValues ?? [] as date, index (index)}
      <div>
        Editing input {index + 1}: {date.toString() ?? "-"}
      </div>
    {/each}
  </output>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} />
</Toolbar>
