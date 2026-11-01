<script lang="ts">
  import StateVisualizer from "./state-visualizer.svelte"
  import Toolbar from "./toolbar.svelte"
  import * as collapsible from "@zag-js/collapsible"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import type { Snippet } from "svelte"

  interface Props {
    trigger: string
    children: Snippet
    debug?: boolean
    open?: boolean
  }

  const props: Props = $props()

  const id = $props.id()
  const service = useMachine(collapsible.machine, () => ({ id, open: props.open }))
  const api = $derived(collapsible.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <button {...api.getTriggerProps()}>{props.trigger}</button>
  <div {...mergeProps(api.getContentProps(), { style: "background: red" })}>{@render props.children()}</div>
</div>
{#if props.debug}
  <Toolbar viz style="position: fixed; top: 0; right: 0">
    <StateVisualizer state={service} omit={["stylesRef"]} />
  </Toolbar>
{/if}
