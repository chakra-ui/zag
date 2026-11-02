<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"

  let open = $state(false)

  const id = $props.id()
  const service = useMachine(tooltip.machine, (): tooltip.Props => ({
    id,
    open,
    onOpenChange: (details) => (open = details.open),
    positioning: { placement: "right" },
  }))

  const api = $derived(tooltip.connect(service, normalizeProps))
</script>

<button {...api.getTriggerProps()}>Some tooltip</button>
{#if api.open}
  <Portal>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>Tooltip Content</div>
    </div>
  </Portal>
{/if}
