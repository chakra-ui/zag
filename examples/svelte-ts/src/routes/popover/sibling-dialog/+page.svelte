<script lang="ts">
  import ToggleTip from "$lib/components/popover-toggle-tip.svelte"
  import Portal from "$lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/popover.css"
  import "@styles/dialog.css"

  const id = $props.id()
  const service = useMachine(dialog.machine, {
    id,
    // Prevent the dialog from closing when a sibling layer (toggle-tip) is removed
    onRequestDismiss(event) {
      event.preventDefault()
    },
  })
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <div style="padding: 20px; display: flex; flex-direction: row; gap: 12px; align-items: center">
    <ToggleTip />
    <button data-testid="dialog-trigger" {...api.getTriggerProps()}>Open Dialog</button>
  </div>

  {#if api.open}
    <Portal>
      <div {...api.getBackdropProps()}></div>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <h2 {...api.getTitleProps()}>Dialog Title</h2>
          <div {...api.getDescriptionProps()}>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </p>
          </div>
          <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end">
            <button {...api.getCloseTriggerProps()} data-testid="dialog-close">Cancel</button>
            <button data-testid="dialog-save">Save</button>
          </div>
        </div>
      </div>
    </Portal>
  {/if}
</main>
