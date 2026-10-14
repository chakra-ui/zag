<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/popover.css"

  let open = $state(false)

  const id = $props.id()
  const service = useMachine(popover.machine, () => ({
    id,
    onOpenChange: (details) => (open = details.open),
    open,
  }))

  const api = $derived(popover.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()}>Click me</button>
  <Portal>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <div {...api.getTitleProps()}>Presenters</div>
        <div {...api.getDescriptionProps()}>Description</div>
        <button onclick={() => (open = false)}>Action Button</button>
      </div>
    </div>
  </Portal>
</main>
