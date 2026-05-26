<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import Presence from "$lib/components/presence.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(dialog.machine, { id, onOpenChange: console.log })

  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()}> Click me</button>
  <Portal>
    <Presence {...api.getBackdropProps()}></Presence>
    <div {...api.getPositionerProps()}>
      <Presence {...api.getContentProps()}>
        <h2 {...api.getTitleProps()}>Edit profile</h2>
        <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
        <div>
          <input placeholder="Enter name..." />
          <button>Save</button>
        </div>
        <button {...api.getCloseTriggerProps()}>Close</button>
      </Presence>
    </div>
  </Portal>
</main>
