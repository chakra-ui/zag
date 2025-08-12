<script lang="ts">
  import * as scrollArea from "@zag-js/scroll-area"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"

  const id = $props.id()
  const service = useMachine(scrollArea.machine, { id })

  const api = $derived(scrollArea.connect(service, normalizeProps))
</script>

<main class="scroll-area">
  <button onclick={() => api.scrollToEdge({ edge: "bottom" })}>Scroll to bottom</button>
  <div {...api.getRootProps()}>
    <div {...api.getViewportProps()}>
      <div {...api.getContentProps()}>
        {#each Array.from({ length: 100 }) as _, index}
          <div>{index}</div>
        {/each}
      </div>
    </div>
    {#if api.hasOverflowY}
      <div {...api.getScrollbarProps()}>
        <div {...api.getThumbProps()}></div>
      </div>
    {/if}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>