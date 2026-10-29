<script lang="ts">
  import NestedMenu from "#lib/components/menu-in-dialog-nested-menu.svelte"
  import Portal from "#lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/menu.css"
  import "@styles/dialog.css"

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<div style="padding: 20px">
  <button {...api.getTriggerProps()} data-testid="trigger-1">Open Dialog with Nested Menu</button>
  {#if api.open}
    <Portal>
      <div {...api.getBackdropProps()}></div>
      <div data-testid="positioner-1" {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <h2 {...api.getTitleProps()}>Dialog with Nested Menu</h2>
          <p {...api.getDescriptionProps()}>
            This dialog contains a menu with multiple nested submenus. The focus trap should include all menu levels,
            even though they are portalled.
          </p>
          <div style="margin-top: 20px">
            <NestedMenu />
          </div>
          <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end">
            <button {...api.getCloseTriggerProps()}>
              <XIcon />
            </button>
          </div>
        </div>
      </div>
    </Portal>
  {/if}
</div>
