<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import Presence from "$lib/components/presence.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  let inputRef = $state<HTMLInputElement>()

  const service = useMachine(dialog.machine, () => ({
    id,
    initialFocusEl: () => inputRef ?? null,
  }))

  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()}>Open dialog</button>
  <Portal>
    <Presence {...api.getBackdropProps()}></Presence>
    <div {...api.getPositionerProps()}>
      <Presence {...api.getContentProps()}>
        <button {...api.getCloseTriggerProps()}>Close</button>
        <h2 {...api.getTitleProps()}>Edit profile</h2>
        <p {...api.getDescriptionProps()}>The name input receives focus via initialFocusEl.</p>
        <input bind:this={inputRef} placeholder="Enter name..." />
        <button>Save</button>
      </Presence>
    </div>
  </Portal>
</main>
