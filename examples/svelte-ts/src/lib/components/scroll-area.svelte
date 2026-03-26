<script lang="ts">
  import * as scrollArea from "@zag-js/scroll-area"
  import { normalizeProps, useMachine, mergeProps } from "@zag-js/svelte"
  import type { Snippet } from "svelte"
  import type { HTMLAttributes } from "svelte/elements"

  interface Props extends HTMLAttributes<HTMLDivElement> {
    children?: Snippet
  }

  const { children, ...rest }: Props = $props()

  const id = $props.id()
  const service = useMachine(scrollArea.machine, { id })

  const api = $derived(scrollArea.connect(service, normalizeProps))
</script>

<div {...mergeProps(api.getRootProps(), rest)}>
  <div {...api.getViewportProps()}>
    <div {...api.getContentProps()}>
      {@render children?.()}
    </div>
  </div>
  {#if api.hasOverflowY}
    <div {...api.getScrollbarProps()}>
      <div {...api.getThumbProps()}></div>
    </div>
  {/if}
</div>
