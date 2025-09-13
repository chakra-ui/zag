<script lang="ts">
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import type { Snippet } from "svelte"

  interface Props {
    children?: Snippet
  }

  const { children }: Props = $props()

  const id = $props.id()
  const service = useMachine(popover.machine, { id })

  const api = $derived(popover.connect(service, normalizeProps))
</script>

<button {...api.getTriggerProps()}> Click me </button>
<div {...api.getPositionerProps()}>
  <div {...api.getContentProps()}>
    <div {...api.getArrowProps()}>
      <div {...api.getArrowTipProps()}></div>
    </div>
    <div {...api.getTitleProps()}>Popover Title</div>
    {@render children?.()}
  </div>
</div>
