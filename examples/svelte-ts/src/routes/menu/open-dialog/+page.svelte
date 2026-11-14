<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as dialog from "@zag-js/dialog"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/menu.css"
  import "@styles/dialog.css"

  let triggerEl = $state<HTMLButtonElement | null>(null)

  const id = $props.id()
  const menuService = useMachine(menu.machine, {
    id: `${id}-menu`,
    onSelect({ value }) {
      if (value === "delete") dialogApi.setOpen(true)
    },
  })
  const menuApi = $derived(menu.connect(menuService, normalizeProps))

  const dialogService = useMachine(dialog.machine, {
    id: `${id}-dialog`,
    role: "alertdialog",
    // Back to the trigger, since the item that opened the dialog is gone
    finalFocusEl: () => triggerEl,
  })
  const dialogApi = $derived(dialog.connect(dialogService, normalizeProps))
</script>

<main>
  <button bind:this={triggerEl} {...menuApi.getTriggerProps()}>
    Actions <span {...menuApi.getIndicatorProps()}>▾</span>
  </button>
  <Portal>
    <div {...menuApi.getPositionerProps()}>
      <ul {...menuApi.getContentProps()}>
        <li {...menuApi.getItemProps({ value: "edit" })}>Edit</li>
        <li {...menuApi.getItemProps({ value: "duplicate" })}>Duplicate</li>
        <li {...menuApi.getItemProps({ value: "delete" })}>Delete…</li>
      </ul>
    </div>
  </Portal>

  <Portal>
    <Presence {...dialogApi.getBackdropProps()} />
    <div {...dialogApi.getPositionerProps()}>
      <Presence {...dialogApi.getContentProps()}>
        <h2 {...dialogApi.getTitleProps()}>Delete project?</h2>
        <p {...dialogApi.getDescriptionProps()}>This can't be undone.</p>
        <button {...dialogApi.getCloseTriggerProps()}>Cancel</button>
        <button onclick={() => dialogApi.setOpen(false)}>Delete</button>
      </Presence>
    </div>
  </Portal>
</main>

<Toolbar>
  <StateVisualizer state={menuService} />
</Toolbar>
