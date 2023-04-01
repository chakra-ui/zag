<script lang="ts">
  import * as select from "@zag-js/select"
  import { attach, useMachine, normalizeProps } from "@zag-js/svelte"
  import StateVisualizer from "../../components/state-visualizer.svelte"
  import Toolbar from "../../components/toolbar.svelte"

  const selectData = [
    { label: "Nigeria", value: "NG" },
    { label: "Japan", value: "JP" },
    { label: "Korea", value: "KO" },
    { label: "Kenya", value: "KE" },
    { label: "United Kingdom", value: "UK" },
    { label: "Ghana", value: "GH" },
    { label: "Uganda", value: "UG" },
  ]

  const [state, send] = useMachine(select.machine({ id: "my-select" }))
  $: api = select.connect($state, send, normalizeProps)
</script>

<div style="min-width: 50%;">
  <div>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label {...api.labelProps.attrs} use:attach={api.labelProps.rest}>Label</label>
    <button {...api.triggerProps.attrs} use:attach={api.triggerProps.rest}>
      {#if !api.selectedOption}
        <span>Select option</span>
      {:else}
        {api.selectedOption.label}
      {/if}
    </button>
  </div>

  <div {...api.positionerProps.attrs} use:attach={api.positionerProps.rest}>
    <ul {...api.contentProps.attrs} use:attach={api.contentProps.rest}>
      {#each selectData as { label, value }}
        <li 
          {...api.getOptionProps({ label, value }).attrs} 
          use:attach={api.getOptionProps({ label, value }).rest}
        >
          <span>{label}</span>
          {#if api.selectedOption && value === api.selectedOption.value}✓{/if}
        </li>
      {/each}
    </ul>
  </div>
</div>

<Toolbar>
  <StateVisualizer state={$state} />
</Toolbar>
