<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine, portal } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"

  const id = "tip-1"
  const id2 = "tip-2"

  const service = useMachine(tooltip.machine, { id })
  const service2 = useMachine(tooltip.machine, { id: id2 })

  const api = $derived(tooltip.connect(service, normalizeProps))
  const api2 = $derived(tooltip.connect(service2, normalizeProps))
</script>

<main class="tooltip">
  <div class="root">
    <button data-testid={`${id}-trigger`} {...api.getTriggerProps()}> Hover me </button>
    {#if api.open}
      <div {...api.getPositionerProps()}>
        <div class="tooltip-content" data-testid={`${id}-tooltip`} {...api.getContentProps()}>Tooltip</div>
      </div>
    {/if}
    <button data-testid={`${id2}-trigger`} {...api2.getTriggerProps()}> Over me </button>
    {#if api2.open}
      <div use:portal {...api2.getPositionerProps()}>
        <div class="tooltip-content" data-testid={`${id2}-tooltip`} {...api2.getContentProps()}>Tooltip 2</div>
      </div>
    {/if}
  </div>
</main>

<Toolbar controls={null}>
  <StateVisualizer state={service} label="Tooltip 1" />
  <StateVisualizer state={service2} label="Tooltip 2" />
</Toolbar>
