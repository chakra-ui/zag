<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/dialog.css"

  let open = $state(false)

  const service = useMachine(dialog.machine, () => ({
    id: "1",
    open,
    onOpenChange(details) {
      open = details.open
    },
  }))
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<div>
  <button onclick={() => (open = !open)}>Open Dialog</button>
  <p>state - isOpen: {String(open)}</p>
  <p>machine - isOpen: {String(api.open)}</p>
  {#if api.open}
    <Portal>
      <div {...api.getBackdropProps()}></div>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <h2 {...api.getTitleProps()}>Edit profile</h2>
          <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
          <div>
            <input placeholder="Enter name..." />
            <button>Save</button>
          </div>
          <button {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
    </Portal>
  {/if}
</div>
