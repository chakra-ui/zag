<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { mergeProps, normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import * as toolbar from "@zag-js/toolbar"
  import * as tooltip from "@zag-js/tooltip"
  import "@styles/toolbar.css"
  import "@styles/tooltip.css"

  const id = $props.id()
  const service = useMachine(toolbar.machine, { id })
  const api = $derived(toolbar.connect(service, normalizeProps))

  const tooltipService = useMachine(tooltip.machine, () => ({
    id: `${id}-bold-tip`,
    ids: { trigger: api.getItemId("bold") },
    disabled: api.disabled,
  }))
  const tooltipApi = $derived(tooltip.connect(tooltipService, normalizeProps))
</script>

<main class="toolbar">
  <div {...api.getRootProps()}>
    <button
      class="toolbar-icon-only"
      {...mergeProps(tooltipApi.getTriggerProps(), api.getItemProps({ value: "bold" }))}
      aria-label="Bold"
    >
      <strong>B</strong>
    </button>
    <button class="toolbar-icon-only" {...api.getItemProps({ value: "italic" })} aria-label="Italic"><em>I</em></button>
    <button class="toolbar-icon-only" {...api.getItemProps({ value: "underline" })} aria-label="Underline"><u>U</u></button>
    {#if tooltipApi.open}
      <div use:portal {...tooltipApi.getPositionerProps()}>
        <div {...tooltipApi.getContentProps()}>Bold</div>
      </div>
    {/if}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>

