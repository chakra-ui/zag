<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as hoverCard from "@zag-js/hover-card"
  import { hoverCardControls } from "@zag-js/shared"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

  const controls = useControls(hoverCardControls)

  const [snapshot, send] = useMachine(hoverCard.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(hoverCard.connect(snapshot, send, normalizeProps))
</script>

<main class="hover-card">
  <div style="display:flex; gap:50px">
    <a href="https://twitter.com/zag_js" target="_blank" {...api.triggerProps}> Twitter </a>

    {#if api.open}
      <div use:portal {...api.positionerProps}>
        <div {...api.contentProps}>
          <div {...api.arrowProps}>
            <div {...api.arrowTipProps}></div>
          </div>
          Twitter Preview
          <a href="https://twitter.com/zag_js" target="_blank"> Twitter </a>
        </div>
      </div>
    {/if}

    <div data-part="test-text">Test text</div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>
