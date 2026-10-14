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
          <button {...api.getCloseTriggerProps()} data-no-autofocus>
            <XIcon />
          </button>
          <button data-no-autofocus aria-label="Help">?</button>
          <h2 {...api.getTitleProps()}>Delete item?</h2>
          <p {...api.getDescriptionProps()}>Close and help are skipped. Cancel receives focus.</p>
          <button>Cancel</button>
          <button>Delete</button>
        </div>
      </div>
    </Portal>
  {/if}
</main>
