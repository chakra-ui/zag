<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine, portal } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"

  const id = "tip-1"
  const id2 = "tip-2"

  const [_state, send] = useMachine(tooltip.machine({ id }))
  const [_state2, send2] = useMachine(tooltip.machine({ id: id2 }))

  const api = $derived(tooltip.connect(_state, send, normalizeProps))
  const api2 = $derived(tooltip.connect(_state2, send2, normalizeProps))
</script>

<main class="tooltip">
  <div class="root">
    <button data-testid={`${id}-trigger`} {...api.triggerProps}> Hover me </button>
    {#if api.isOpen}
      <div {...api.positionerProps}>
        <div class="tooltip-content" data-testid={`${id}-tooltip`} {...api.contentProps}>Tooltip</div>
      </div>
    {/if}
    <button data-testid={`${id2}-trigger`} {...api2.triggerProps}> Over me </button>
    {#if api2.isOpen}
      <div use:portal {...api2.positionerProps}>
        <div class="tooltip-content" data-testid={`${id2}-tooltip`} {...api2.contentProps}>Tooltip 2</div>
      </div>
    {/if}
  </div>
</main>

<Toolbar controls={null}>
  <StateVisualizer state={_state} label="Tooltip 1" />
  <StateVisualizer state={_state2} label="Tooltip 2" />
</Toolbar>
