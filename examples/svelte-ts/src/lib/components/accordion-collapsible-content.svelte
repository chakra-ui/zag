<script lang="ts">
  import * as collapsible from "@zag-js/collapsible"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import type { Snippet } from "svelte"

  interface Props extends Record<string, any> {
    open: boolean
    children: Snippet
  }

  const { open, children, ...contentProps }: Props = $props()

  const id = $props.id()
  const service = useMachine(collapsible.machine, () => ({
    id,
    ids: { content: contentProps.id },
    open,
  }))

  const api = $derived(collapsible.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <div {...contentProps} {...api.getContentProps()}>{@render children()}</div>
</div>
