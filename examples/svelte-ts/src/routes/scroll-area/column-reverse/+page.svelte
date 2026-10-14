<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as scrollArea from "@zag-js/scroll-area"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/scroll-area.css"

  const id = $props.id()
  const service = useMachine(scrollArea.machine, { id })

  const api = $derived(scrollArea.connect(service, normalizeProps))
</script>

<main class="scroll-area">
  <div {...api.getRootProps()}>
    <div {...api.getViewportProps()}>
      <div {...mergeProps(api.getContentProps(), { style: { display: "flex", flexDirection: "column-reverse" } })}>
        {#each Array.from({ length: 100 }) as _, index}
          <div>Item {index}</div>
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
