<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import { goto } from "$app/navigation"
  import { page } from "$app/state"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/dialog.css"

  const showDialog = $derived(page.url.searchParams.get("show-dialog") === "true")
  const pathname = $derived(page.url.pathname)

  const id = $props.id()
  const service = useMachine(dialog.machine, () => ({
    id,
    open: showDialog,
    onOpenChange: (details) => {
      goto(`${pathname}?show-dialog=${details.open}`)
    },
  }))

  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<div style="padding: 40px; height: 200vh">
  <h1>Dialog Search Params</h1>
  <h1>{String(showDialog)}</h1>

  <button onclick={() => goto(`${pathname}?show-dialog=true`)}>Open</button>
  <button onclick={() => goto(`${pathname}?show-dialog=false`)}>Close</button>

  <button {...api.getTriggerProps()}>Open Dialog</button>
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
