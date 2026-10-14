<script lang="ts">
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Portal from "./portal.svelte"
  import Presence from "./presence.svelte"

  let open = $state(false)

  $effect(() => {
    if (!open) return
    const timer = setTimeout(() => (open = false), 2000)
    return () => clearTimeout(timer)
  })

  const id = $props.id()
  const service = useMachine(popover.machine, () => ({
    id,
    open,
    onOpenChange(details) {
      open = details.open
    },
    closeOnInteractOutside: false,
    restoreFocus: false,
  }))

  const api = $derived(popover.connect(service, normalizeProps))
</script>

<div style="display: inline-block">
  <button data-testid="toggletip-trigger" {...api.getTriggerProps()}>ℹ Info</button>
  <Portal>
    <div {...api.getPositionerProps()}>
      <Presence data-testid="toggletip-content" class="popover-content" {...api.getContentProps()}>
        <div {...api.getArrowProps()}>
          <div {...api.getArrowTipProps()}></div>
        </div>
        <div {...api.getTitleProps()}>Toggle Tip</div>
        <div data-part="body">This is some additional information. It will close in 2 seconds.</div>
      </Presence>
    </div>
  </Portal>
</div>
