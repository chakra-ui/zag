<script lang="ts">
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import Portal from "./portal.svelte"

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
        <button>Action Button</button>
        <button {...api.getCloseTriggerProps()}>
          <XIcon />
        </button>
      </div>
    </div>
  </Portal>
</main>
