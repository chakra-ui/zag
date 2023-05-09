<script lang="ts">
  import * as select from "@zag-js/select"
  import { events, useMachine, normalizeProps } from "@zag-js/svelte"
  import StateVisualizer from "../../components/state-visualizer.svelte"
  import Toolbar from "../../components/toolbar.svelte"
  import { writable } from "svelte/store"

  const selectData = [
    { label: "Nigeria", value: "NG" },
    { label: "Japan", value: "JP" },
    { label: "Korea", value: "KO" },
    { label: "Kenya", value: "KE" },
    { label: "United Kingdom", value: "UK" },
    { label: "Ghana", value: "GH" },
    { label: "Uganda", value: "UG" },
  ]

  const readOnly = writable(true)
  const loop = true

  // Typecheck fails here because it expects readOnly to be a boolean and not a store
  // @ts-ignore
  const [state, send] = useMachine(select.machine({ id: "my-select" }), { context: { readOnly, loop } })
  const api = writable(select.connect($state, send, normalizeProps))

  state.subscribe((newState) => {
    api.set(select.connect(newState, send, normalizeProps))
  })
</script>

<div style="min-width: 50%;">
  <div>
    <button
      on:click={() => {
        $readOnly = !$readOnly
      }}>Toggle readonly {$readOnly}</button
    >
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label {...$api.labelProps.attrs} use:events={$api.labelProps.handlers}>Label</label>
    <button {...$api.triggerProps.attrs} use:events={$api.triggerProps.handlers}>
      {#if !$api.selectedOption}
        <span>Select option</span>
      {:else}
        {$api.selectedOption.label}
      {/if}
    </button>
  </div>

  <div {...$api.positionerProps.attrs} use:events={$api.positionerProps.handlers}>
    <ul {...$api.contentProps.attrs} use:events={$api.contentProps.handlers}>
      {#each selectData as { label, value }}
        <li
          {...$api.getOptionProps({ label, value }).attrs}
          use:events={$api.getOptionProps({ label, value }).handlers}
        >
          <span>{label}</span>
          {#if $api.selectedOption && value === $api.selectedOption.value}✓{/if}
        </li>
      {/each}
    </ul>
  </div>
</div>

<Toolbar>
  <StateVisualizer state={$state} />
</Toolbar>
