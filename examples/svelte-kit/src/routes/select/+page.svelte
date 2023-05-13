<script lang="ts">
  import * as select from "@zag-js/select"
  import { events, useMachine, normalizeProps } from "@zag-js/svelte"
  import StateVisualizer from "../../components/state-visualizer.svelte"
  import Toolbar from "../../components/toolbar.svelte"
  import { ControlsUI, useControls } from "../../stores/controls"
  import { selectControls } from "../../../../../shared/src/controls"
  import { selectData } from "../../../../../shared/src/data"

  const [context, defaultValues] = useControls(selectControls)
  $: $context = defaultValues

  const [state, send] = useMachine(select.machine({ id: "my-select" }), { context })

  $: api = select.connect($state, send, normalizeProps)
</script>

<div style="min-width: 50%;">
  <div>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label {...api.labelProps.attrs} use:events={api.labelProps.handlers}>Label</label>
    <button {...api.triggerProps.attrs} use:events={api.triggerProps.handlers}>
      {#if !api.selectedOption}
        <span>Select option</span>
      {:else}
        {api.selectedOption.label}
      {/if}
    </button>
  </div>

  <div {...api.positionerProps.attrs} use:events={api.positionerProps.handlers}>
    <ul {...api.contentProps.attrs} use:events={api.contentProps.handlers}>
      {#each selectData as { label, value }}
        <li {...api.getOptionProps({ label, value }).attrs} use:events={api.getOptionProps({ label, value }).handlers}>
          <span>{label}</span>
          {#if api.selectedOption && value === api.selectedOption.value}✓{/if}
        </li>
      {/each}
    </ul>
  </div>
</div>

<Toolbar>
  <ControlsUI slot="controls" {context} controls={selectControls} />
  <StateVisualizer state={$state} />
</Toolbar>
