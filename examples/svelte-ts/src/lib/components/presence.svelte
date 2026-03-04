<script lang="ts">
  import * as presence from "@zag-js/presence"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import type { Snippet } from "svelte"
  interface Props {
    hidden?: boolean | string | null | undefined
    children?: Snippet
    [key: string]: any
  }
  let { hidden = false, children, ...rest }: Props = $props()
  let present = $derived(!Boolean(hidden))
  let service = useMachine(presence.machine, () => ({
    present,
  }))
  let api = $derived(presence.connect(service, normalizeProps))
  function setNode(node: HTMLDivElement) {
    api.setNode(node)
  }
</script>

<div
  {@attach setNode}
  data-scope="presence"
  {...rest}
  data-state={api.skip ? undefined : present ? "open" : "closed"}
  hidden={!api.present}
>
  {@render children?.()}
</div>
