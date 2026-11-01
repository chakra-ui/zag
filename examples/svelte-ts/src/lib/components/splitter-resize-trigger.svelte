<script lang="ts">
  import type * as splitter from "@zag-js/splitter"
  import { getSplitterApi } from "./splitter-panel-group.svelte"

  const props: splitter.ResizeTriggerProps = $props()
  const api = getSplitterApi()
</script>

<div {...api().getResizeTriggerProps(props)}></div>
