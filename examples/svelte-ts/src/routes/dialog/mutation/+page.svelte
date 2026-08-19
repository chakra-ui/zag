<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  let nextContent = $state(false)

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })

  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()}> Click me</button>
  <Portal>
    <div {...api.getBackdropProps()}></div>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        {#if !nextContent}
          <button onclick={() => (nextContent = true)}>Set next content</button>
        {/if}
        {#if nextContent}
          <button onclick={() => (nextContent = false)}>Set previous content</button>
        {/if}
      </div>
    </div>
  </Portal>
</main>
