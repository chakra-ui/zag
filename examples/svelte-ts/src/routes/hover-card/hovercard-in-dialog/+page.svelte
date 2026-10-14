<script lang="ts">
  import HoverCard from "$lib/components/hover-card-in-dialog-card.svelte"
  import Portal from "$lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/hover-card.css"
  import "@styles/dialog.css"

  const id = $props.id()
  const service = useMachine(dialog.machine, { id, initialFocusEl: null })
  const api = $derived(dialog.connect(service, normalizeProps))

  let contentRef = $state<HTMLDivElement>()
</script>

<div style="padding: 20px">
  <button {...api.getTriggerProps()} data-testid="trigger-1">Open Dialog</button>
  {#if api.open}
    <Portal>
      <div {...api.getBackdropProps()}></div>
      <div data-testid="positioner-1" {...api.getPositionerProps()}>
        <div
          bind:this={contentRef}
          {...mergeProps(api.getContentProps(), { style: { width: "400px", height: "400px" } })}
        >
          <HoverCard container={contentRef} />
        </div>
      </div>
    </Portal>
  {/if}
</div>
