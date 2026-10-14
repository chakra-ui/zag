<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import ControlsPanel from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toolbar from "@zag-js/toolbar"
  import "@styles/toolbar.css"

  let dir = $state<"ltr" | "rtl">("rtl")

  const id = $props.id()
  const service = useMachine(toolbar.machine, () => ({ id, dir }))
  const api = $derived(toolbar.connect(service, normalizeProps))
</script>

<main class="toolbar" {dir}>
  <label>
    <input type="checkbox" checked={dir === "rtl"} onchange={(e) => (dir = e.currentTarget.checked ? "rtl" : "ltr")} />
    RTL
  </label>

  <div {...api.getRootProps()}>
    <button {...api.getItemProps({ value: "cut" })}>Cut</button>
    <button {...api.getItemProps({ value: "copy" })}>Copy</button>
    <button {...api.getItemProps({ value: "paste" })}>Paste</button>
    <button {...api.getItemProps({ value: "select-all" })}>Select All</button>
  </div>

  <p>
    With <code>dir="rtl"</code>, ArrowLeft moves forward (toward the visual start) and ArrowRight moves backward —
    matching reading direction.
  </p>
</main>

<ControlsPanel>
  <StateVisualizer state={service} />
</ControlsPanel>
