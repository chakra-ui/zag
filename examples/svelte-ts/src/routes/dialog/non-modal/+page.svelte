<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(dialog.machine, { id, modal: false, closeOnInteractOutside: true })

  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <button data-testid="trigger-1" {...api.getTriggerProps()}>Open Dialog</button>
  <input data-testid="outside-input" placeholder="Outside input" />
  <p data-testid="outside-content">The page stays interactive while the dialog is open.</p>
  {#if api.open}
    <Portal>
      <div data-testid="positioner-1" {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <h2 {...api.getTitleProps()}>Non-modal dialog</h2>
          <p {...api.getDescriptionProps()}>No backdrop and no focus trap.</p>
          <input placeholder="Enter name..." />
          <button data-testid="close-1" {...api.getCloseTriggerProps()}>Close</button>
        </div>
      </div>
    </Portal>
  {/if}
</main>
