<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import Presence from "$lib/components/presence.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })

  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()}>Open dialog</button>
  <Portal>
    <Presence {...api.getBackdropProps()}></Presence>
    <div {...api.getPositionerProps()}>
      <Presence {...api.getContentProps()}>
        <button {...api.getCloseTriggerProps()} data-no-autofocus>Close</button>
        <button data-no-autofocus aria-label="Help">?</button>
        <h2 {...api.getTitleProps()}>Delete item?</h2>
        <p {...api.getDescriptionProps()}>Close and help are skipped. Cancel receives focus.</p>
        <button>Cancel</button>
        <button>Delete</button>
      </Presence>
    </div>
  </Portal>
</main>
