<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as scrollArea from "@zag-js/scroll-area"
  import { scrollAreaControls } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/scroll-area.css"

  const controls = useControls(scrollAreaControls)

  const id = $props.id()
  const service = useMachine(scrollArea.machine, controls.mergeProps<scrollArea.Props>({ id }))

  const api = $derived(scrollArea.connect(service, normalizeProps))
</script>

<main class="scroll-area">
  <button onclick={() => api.scrollToEdge({ edge: "bottom" })}>Scroll to bottom</button>
  <div {...api.getRootProps()}>
    <div {...api.getViewportProps()}>
      <div {...mergeProps(api.getContentProps(), { style: { minWidth: "800px" } })}>
        {#each Array.from({ length: 100 }) as _, index}
          <div>{index}</div>
        {/each}
      </div>
    </div>
    {#if api.hasOverflowY}
      <div {...api.getScrollbarProps({ orientation: "vertical" })}>
        <div {...api.getThumbProps({ orientation: "vertical" })}></div>
      </div>
    {/if}
    {#if api.hasOverflowX}
      <div {...api.getScrollbarProps({ orientation: "horizontal" })}>
        <div {...api.getThumbProps({ orientation: "horizontal" })}></div>
      </div>
    {/if}
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
