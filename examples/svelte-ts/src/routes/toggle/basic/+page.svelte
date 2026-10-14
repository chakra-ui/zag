<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toggle from "@zag-js/toggle"
  import { BoldIcon } from "lucide-svelte"
  import "@styles/toggle.css"

  const id = $props.id()
  const service = useMachine(toggle.machine, { id })
  const api = $derived(toggle.connect(service, normalizeProps))
</script>

<main class="toggle">
  <button {...api.getRootProps()}>
    <span {...api.getIndicatorProps()}>
      <BoldIcon />
    </span>
  </button>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
