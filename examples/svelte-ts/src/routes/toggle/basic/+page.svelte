<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as toggle from "@zag-js/toggle"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const service = useMachine(toggle.machine, {})

  const api = $derived(toggle.connect(service, normalizeProps))
</script>

<main class="toggle">
  <button {...api.getRootProps()}>
    <span {...api.getIndicatorProps()}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
      </svg>
    </span>
  </button>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
