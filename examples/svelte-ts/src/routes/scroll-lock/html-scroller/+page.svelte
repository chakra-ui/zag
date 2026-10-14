<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/dialog.css"

  const service = useMachine(dialog.machine, { id: "1" })
  const api = $derived(dialog.connect(service, normalizeProps))

  // Make <html> its own scroll container, like an app-shell layout
  $effect(() => {
    document.documentElement.style.overflowY = "auto"
    return () => {
      document.documentElement.style.removeProperty("overflow-y")
    }
  })
</script>

<main>
  <p>The dialog's scroll lock should apply to &lt;html&gt;, not &lt;body&gt;, on this page.</p>

  <button {...api.getTriggerProps()} data-testid="dialog-trigger">Open Dialog</button>

  {#if api.open}
    <Portal>
      <div {...api.getBackdropProps()}></div>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <h2 {...api.getTitleProps()}>Dialog</h2>
          <p {...api.getDescriptionProps()}>Dialog content</p>
          <button {...api.getCloseTriggerProps()} data-testid="dialog-close">
            <XIcon />
          </button>
        </div>
      </div>
    </Portal>
  {/if}

  <Portal>
    <div data-testid="tall-content" style="height: 4000px"></div>
  </Portal>
</main>
