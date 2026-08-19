<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import Presence from "$lib/components/presence.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  let open = $state(false)

  const service = useMachine(dialog.machine, () => ({
    id: "1",
    get open() {
      return open
    },
    onOpenChange(details) {
      open = details.open
    },
  }))

  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <button onclick={() => (open = !open)}>Delayed open</button>
  <p>state - isOpen: {String(open)}</p>
  <p>machine - isOpen: {String(api.open)}</p>
  <Portal>
    <Presence {...api.getBackdropProps()}></Presence>
    <div {...api.getPositionerProps()}>
      <Presence {...api.getContentProps()}>
        <h2 {...api.getTitleProps()}>Edit profile</h2>
        <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
        <button
          onclick={() => {
            setTimeout(() => {
              api.setOpen(false)
            }, 2000)
          }}
        >
          Delayed close
        </button>
        <button {...api.getCloseTriggerProps()}>Close</button>
      </Presence>
    </div>
  </Portal>
</main>
