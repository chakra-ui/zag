<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"

  const id = $props.id()
  const service = useMachine(tooltip.machine, { id })
  const api = $derived(tooltip.connect(service, normalizeProps))
</script>

<button {...api.getTriggerProps()}>Hover me</button>
{#if api.open}
  <Portal>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>Tooltip</div>
    </div>
  </Portal>
{/if}
