<script lang="ts">
  import * as select from "@zag-js/select"
  import { spreadRest, useMachine, normalizeProps } from "@zag-js/svelte"
  import StateVisualizer from "../components/state-visualizer.svelte"
  import Toolbar from "../components/toolbar.svelte"

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
    <label use:spreadRest={api.labelProps} {...api.labelProps.attributes}>Label</label>
    <button use:spreadRest={api.triggerProps} {...api.triggerProps.attributes}>
      {#if !api.selectedOption}
        <span>Select option</span>
      {:else}
        {api.selectedOption.label}
      {/if}
    </button>
  </div>
  <div use:spreadRest={api.positionerProps} {...api.positionerProps.attributes}>
    <ul use:spreadRest={api.contentProps} {...api.contentProps.attributes}>
      {#each selectData as { label, value }}
        <li
          use:spreadRest={api.getOptionProps({ label, value })}
          {...api.getOptionProps({ label, value }).attributes}
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
