<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/dialog.css"

  const id = $props.id()
  const service = useMachine(dialog.machine, {
    id,
    // opt out of initial focus entirely: nobody clicked, so nothing should ring
    initialFocusEl: () => false,
  })
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <input data-testid="outside-input" placeholder="Focus stays here" />
  <button data-testid="open-button" onclick={() => api.setOpen(true)}>Open dialog programmatically</button>
  {#if api.open}
    <Portal>
      <div {...api.getBackdropProps()}></div>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <button {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>
          <h2 {...api.getTitleProps()}>Special offer</h2>
          <p {...api.getDescriptionProps()}>Opened without moving focus. Tab and Escape still work.</p>
          <input placeholder="Enter name..." />
          <button>Save</button>
        </div>
      </div>
    </Portal>
  {/if}
</main>
