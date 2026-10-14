<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import ControlsPanel from "$lib/components/toolbar.svelte"
  import IconButton from "$lib/components/toolbar-icon-button.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toolbar from "@zag-js/toolbar"
  import "@styles/toolbar.css"
  import "@styles/tooltip.css"

  const id = $props.id()
  const service = useMachine(toolbar.machine, { id })
  const api = $derived(toolbar.connect(service, normalizeProps))
</script>

<main class="toolbar">
  <div {...api.getRootProps()}>
    <IconButton {api} value="bold" label="Bold">
      <strong>B</strong>
    </IconButton>
    <IconButton {api} value="italic" label="Italic">
      <em>I</em>
    </IconButton>
    <IconButton {api} value="underline" label="Underline">
      <u>U</u>
    </IconButton>
  </div>
  <p>Hover or focus an icon button to see its tooltip. Arrow keys still move roving focus normally.</p>
</main>

<ControlsPanel>
  <StateVisualizer state={service} />
</ControlsPanel>
