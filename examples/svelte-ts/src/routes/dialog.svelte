<script lang="ts">
  import * as dialog from "@zag-js/dialog"
  import { portal, normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })
 
 const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()}> Click me</button>
  {#if api.open}
    <div use:portal {...api.getBackdropProps()}></div>
    <div use:portal {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <h2 {...api.getTitleProps()}>Edit profile</h2>
        <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
        <div>
          <input placeholder="Enter name..." />
          <button>Save</button>
        </div>
        <button {...api.getCloseTriggerProps()}>Close</button>
      </div>
    </div>
  {/if}
</main>
