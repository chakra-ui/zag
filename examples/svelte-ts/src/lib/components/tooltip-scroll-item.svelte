<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import type { Snippet } from "svelte"

  interface Props {
    children: Snippet
    closeOnPointerDown?: boolean
  }

  const { children, closeOnPointerDown }: Props = $props()

  const id = $props.id()
  const service = useMachine(tooltip.machine, (): tooltip.Props => ({
    id,
    positioning: { placement: "right" },
    openDelay: 100,
    closeDelay: 100,
    closeOnPointerDown,
  }))

  const api = $derived(tooltip.connect(service, normalizeProps))
</script>

<button {...api.getTriggerProps()}>{@render children()}</button>
<Portal>
  {#if api.open}
    <div {...api.getPositionerProps()}>
      <div class="tooltip-content" {...api.getContentProps()}>
        <div {...api.getArrowProps()}>
          <div {...api.getArrowTipProps()}></div>
        </div>
        Tooltip
      </div>
    </div>
  {/if}
</Portal>
