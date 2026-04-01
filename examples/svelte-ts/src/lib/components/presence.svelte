<script lang="ts">
  import * as presence from "@zag-js/presence"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import type { Snippet } from "svelte"
  interface Props {
    hidden?: boolean | string | null | undefined
    /**
     * Whether to enable lazy mounting.
     */
    lazyMount?: boolean
    /**
     * Whether to skip the initial mount animation.
     */
    skipAnimationOnMount?: boolean
    /**
     * Whether to unmount the component when it's not present.
     */
    unmountOnExit?: boolean
    children?: Snippet
    [key: string]: any
  }
  let { hidden = false, lazyMount = false, skipAnimationOnMount = false, unmountOnExit = false, children, ...rest }: Props = $props()
  let present = $derived(!Boolean(hidden))
  let service = useMachine(presence.machine, () => ({
    present,
  }))
  let api = $derived(presence.connect(service, normalizeProps))
  function setNode(node: HTMLDivElement) {
    api.setNode(node)
  }

  let wasEverPresent = $state(false)
  $effect(() => {
    if (api.present) wasEverPresent = true
  })

  let unmounted = $derived(
    (!api.present && !wasEverPresent && lazyMount) ||
    (unmountOnExit && !api.present && wasEverPresent)
  )
</script>

{#if !unmounted}
<div
  {@attach setNode}
  data-scope="presence"
  {...rest}
  data-state={api.skip && skipAnimationOnMount ? undefined : present ? "open" : "closed"}
  hidden={!api.present}
>
  {@render children?.()}
</div>
{/if}
