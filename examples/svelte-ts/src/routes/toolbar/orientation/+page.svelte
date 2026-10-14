<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import ControlsPanel from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toolbar from "@zag-js/toolbar"
  import "@styles/toolbar.css"

  const items = [
    { value: "bold", label: "B" },
    { value: "italic", label: "I" },
    { value: "underline", label: "U" },
  ]

  const id = $props.id()
  const service = useMachine(toolbar.machine, { id, orientation: "vertical" })
  const api = $derived(toolbar.connect(service, normalizeProps))
</script>

<main class="toolbar">
  <div {...api.getRootProps()}>
    <button {...api.getItemProps({ value: "cut" })}>Cut</button>
    <button {...api.getItemProps({ value: "copy" })}>Copy</button>
    <button {...api.getItemProps({ value: "paste" })}>Paste</button>

    <div {...api.getSeparatorProps()}></div>

    <div {...api.getGroupProps({ value: "format" })}>
      {#each items as item (item.value)}
        <button {...api.getItemProps({ value: item.value })}>{item.label}</button>
      {/each}
    </div>
  </div>
</main>

<ControlsPanel>
  <StateVisualizer state={service} context={["focusedValue"]} />
</ControlsPanel>
