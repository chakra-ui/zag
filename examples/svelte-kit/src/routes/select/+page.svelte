<script>
  import * as select from "@zag-js/select"
  import { zag, useMachine, normalizeProps } from "@zag-js/svelte"
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
    <label use:zag={api.labelProps.handlers} {...api.labelProps.attributes}>Label</label>
    <button use:zag={api.triggerProps.handlers} {...api.triggerProps.attributes}>
      {#if !api.selectedOption}
        <span>Select option</span>
      {:else}
        {api.selectedOption.label}
      {/if}
    </button>
  </div>
  <!-- <Portal> -->
  <div use:zag={api.positionerProps.handlers} {...api.positionerProps.attributes}>
    <ul use:zag={api.contentProps.handlers} {...api.contentProps.attributes}>
      {#each selectData as { label, value }}
        <li
          use:zag={api.getOptionProps({ label, value }).handlers}
          {...api.getOptionProps({ label, value }).attributes}
        >
          <span>{label}</span>
          {#if api.selectedOption && value === api.selectedOption.value}✓{/if}
        </li>
      {/each}
    </ul>
  </div>
  <!-- </Portal> -->
</div>

<Toolbar>
  <StateVisualizer state={$state} />
</Toolbar>
