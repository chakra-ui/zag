<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import ControlsPanel from "#lib/components/toolbar.svelte"
  import IconButton from "#lib/components/toolbar-icon-button.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toolbar from "@zag-js/toolbar"
  import { Bold, Italic, Underline } from "lucide-svelte"
  import "@styles/toolbar.css"
  import "@styles/tooltip.css"

  const id = $props.id()
  const service = useMachine(toolbar.machine, { id })
  const api = $derived(toolbar.connect(service, normalizeProps))
</script>

<main class="toolbar">
  <div {...api.getRootProps()}>
    <IconButton {api} value="bold" label="Bold">
      <Bold />
    </IconButton>
    <IconButton {api} value="italic" label="Italic">
      <Italic />
    </IconButton>
    <IconButton {api} value="underline" label="Underline">
      <Underline />
    </IconButton>
  </div>
  <p class="toolbar-note">
    Hover or focus an icon button to see its tooltip. Arrow keys still move roving focus normally.
  </p>
</main>

<ControlsPanel>
  <StateVisualizer state={service} />
</ControlsPanel>
