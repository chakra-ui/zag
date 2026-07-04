<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toolbar from "@zag-js/toolbar"
  import "@styles/toolbar.css"

  const id = $props.id()
  const service = useMachine(toolbar.machine, { id, orientation: "vertical" })
  const api = $derived(toolbar.connect(service, normalizeProps))

  const items = [
    { value: "bold", label: "B" },
    { value: "italic", label: "I" },
    { value: "underline", label: "U" },
  ]
</script>

<main class="toolbar">
  <div {...api.getRootProps()}>
    <button {...api.getItemProps({ value: "cut" })}>Cut</button>
    <button {...api.getItemProps({ value: "copy" })}>Copy</button>
    <button {...api.getItemProps({ value: "paste" })}>Paste</button>
    <div {...api.getSeparatorProps()}></div>
    <div {...api.getGroupProps({ value: "format" })}>
      {#each items as item}
        <button {...api.getItemProps({ value: item.value })}>{item.label}</button>
      {/each}
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>

