<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toolbar from "@zag-js/toolbar"
  import "@styles/toolbar.css"

  const id = $props.id()
  const service = useMachine(toolbar.machine, { id, dir: "rtl" })
  const api = $derived(toolbar.connect(service, normalizeProps))
</script>

<main class="toolbar" dir="rtl">
  <div {...api.getRootProps()}>
    <button {...api.getItemProps({ value: "cut" })}>Cut</button>
    <button {...api.getItemProps({ value: "copy" })}>Copy</button>
    <button {...api.getItemProps({ value: "paste" })}>Paste</button>
    <button {...api.getItemProps({ value: "select-all" })}>Select All</button>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>

