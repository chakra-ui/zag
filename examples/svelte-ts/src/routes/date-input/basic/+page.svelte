<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
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
    }),
  )

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
    <div>Selected: {api.valueAsString.join(", ") || "-"}</div>
    <div>Placeholder: {api.placeholderValue.toString()}</div>
    <div>Editing: {api.displayValues?.[0]?.toString() ?? "-"}</div>
  </output>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} />
</Toolbar>
