<script lang="ts">
  import type * as splitter from "@zag-js/splitter"
  import type { Snippet } from "svelte"
  import { getSplitterApi } from "./splitter-panel-group.svelte"

  interface Props extends splitter.PanelProps {
    children?: Snippet
  }

  const { children, ...props }: Props = $props()
  const api = getSplitterApi()
</script>

<div {...api().getPanelProps(props)}>
  {@render children?.()}
</div>
