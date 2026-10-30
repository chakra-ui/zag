<script lang="ts">
  import NestedPopover from "#lib/components/popover-in-dialog-nested.svelte"
  import Portal from "#lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/popover.css"
  import "@styles/dialog.css"

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<div style="padding: 20px">
  <button {...api.getTriggerProps()} data-testid="dialog-trigger">Open Dialog with Nested Popovers</button>
  {#if api.open}
    <Portal>
      <div {...api.getBackdropProps()}></div>
      <div data-testid="dialog-positioner" {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <h2 {...api.getTitleProps()}>Dialog with Nested Popovers</h2>
          <p {...api.getDescriptionProps()}>
            This dialog contains multiple nested popovers. The focus trap should include all popover levels, even though
            they are portalled.
          </p>
          <div style="margin-top: 20px">
            <NestedPopover />
          </div>
          <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end">
            <button {...api.getCloseTriggerProps()} data-testid="dialog-close">Close Dialog</button>
          </div>
        </div>
      </div>
    </Portal>
  {/if}
</div>
