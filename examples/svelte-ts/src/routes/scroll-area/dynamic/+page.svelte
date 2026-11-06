<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as scrollArea from "@zag-js/scroll-area"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/scroll-area.css"

  let count = $state(3)
  const id = $props.id()
  const service = useMachine(scrollArea.machine, { id })
  const api = $derived(scrollArea.connect(service, normalizeProps))
</script>

<main class="scroll-area">
  <div style="display: flex; gap: 8px">
    <button onclick={() => (count = 40)}>Add rows</button>
    <button onclick={() => (count = 3)}>Remove rows</button>
    <button onclick={() => api.scrollToEdge({ edge: "bottom" })}>Scroll to bottom</button>
  </div>
  <div {...api.getRootProps()}>
    <div {...api.getViewportProps()}>
      <div {...api.getContentProps()}>
        {#each Array.from({ length: count }) as _, index}
          <div>Row {index + 1}</div>
        {/each}
      </div>
    </div>
    {#if api.hasOverflowY}
      <div {...api.getScrollbarProps({ orientation: "vertical" })}>
        <div {...api.getThumbProps({ orientation: "vertical" })}></div>
      </div>
    {/if}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
