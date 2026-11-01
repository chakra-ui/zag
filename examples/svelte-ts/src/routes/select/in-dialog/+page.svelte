<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import SelectNested from "#lib/components/select-nested.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/select.css"
  import "@styles/dialog.css"

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<div style="padding: 20px">
  <button {...api.getTriggerProps()} data-testid="trigger-1">Open Dialog</button>
  {#if api.open}
    <Portal>
      <div {...api.getBackdropProps()}></div>
      <div data-testid="positioner-1" {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <h2 {...api.getTitleProps()}>Edit profile</h2>
          <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
          <SelectNested />
        </div>
      </div>
    </Portal>
  {/if}
</div>
