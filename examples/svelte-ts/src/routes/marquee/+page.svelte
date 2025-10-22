<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as marquee from "@zag-js/marquee"
  import { marqueeControls, marqueeData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(marqueeControls)

  const id = $props.id()
  const service = useMachine(
    marquee.machine,
    controls.mergeProps<marquee.Props>({
      id,
      spacing: "2rem",
    }),
  )

  const api = $derived(marquee.connect(service, normalizeProps))
</script>

<main class="marquee">
  <div {...api.getRootProps()}>
    <div {...api.getEdgeProps({ side: "start" })}></div>

    <div {...api.getViewportProps()}>
      {#each Array.from({ length: api.contentCount }) as _, index}
        <div {...api.getContentProps({ index })}>
          {#each marqueeData as item}
            <div class="marquee-item">
              <span class="marquee-logo">{item.logo}</span>
              <span class="marquee-name">{item.name}</span>
            </div>
          {/each}
        </div>
      {/each}
    </div>

    <div {...api.getEdgeProps({ side: "end" })}></div>
  </div>

  <div class="controls">
    <button onclick={() => api.pause()}>Pause</button>
    <button onclick={() => api.resume()}>Resume</button>
    <button onclick={() => api.togglePause()}>Toggle</button>
    <span>Status: {api.paused ? "Paused" : "Playing"}</span>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
