<script lang="ts">
  import * as dialog from "@zag-js/dialog"
  import { portal, normalizeProps, useMachine } from "@zag-js/svelte"

  const [snapshot, send] = useMachine(dialog.machine({ id: "1" }))
  const api = $derived(dialog.connect(snapshot, send, normalizeProps))
</script>

<main>
  <button {...api.triggerProps}> Click me</button>
  {#if api.open}
    <div use:portal {...api.backdropProps}></div>
    <div use:portal {...api.positionerProps}>
      <div {...api.contentProps}>
        <h2 {...api.titleProps}>Edit profile</h2>
        <p {...api.descriptionProps}>Make changes to your profile here. Click save when you are done.</p>
        <div>
          <input placeholder="Enter name..." />
          <button>Save</button>
        </div>
        <button {...api.closeTriggerProps}>Close</button>
      </div>
    </div>
  {/if}
</main>
