<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/dialog.css"

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()}>Open dialog</button>
  {#if api.open}
    <Portal>
      <div {...api.getBackdropProps()}></div>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <button {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>
          <h2 {...api.getTitleProps()}>Edit profile</h2>
          <p {...api.getDescriptionProps()}>The name input receives focus via data-autofocus.</p>
          <input data-autofocus placeholder="Enter name..." />
          <button>Save</button>
        </div>
      </div>
    </Portal>
  {/if}
</main>
