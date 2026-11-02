<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import "@styles/tooltip.css"

  let open = $state(false)

  const id = $props.id()
  const service = useMachine(tooltip.machine, (): tooltip.Props => ({
    id,
    open,
    onOpenChange: (details) => (open = details.open),
  }))

  const api = $derived(tooltip.connect(service, normalizeProps))
</script>

<div style="padding: 40px; height: 200vh">
  <h1>Tooltip Controlled</h1>
  <h1>{String(open)}</h1>

  <div style="display: flex; gap: 20px">
    <button type="button" onclick={() => (open = true)}>Open</button>
    <button type="button" onclick={() => (open = false)}>Close</button>

    <button {...api.getTriggerProps()}>Some tooltip</button>
    {#if api.open}
      <Portal>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>Tooltip Content</div>
        </div>
      </Portal>
    {/if}
  </div>
</div>
