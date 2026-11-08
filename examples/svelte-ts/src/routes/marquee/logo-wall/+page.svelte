<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as marquee from "@zag-js/marquee"
  import { marqueeBrands } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/marquee.css"

  const id = $props.id()
  const service = useMachine(marquee.machine, {
    id,
    autoFill: true,
    spacing: "1.5rem",
  })

  const api = $derived(marquee.connect(service, normalizeProps))
</script>

<main>
  <div class="logo-wall">
    <div {...api.getRootProps()}>
      <div {...api.getEdgeProps({ side: "start" })}></div>

      <div {...api.getViewportProps()}>
        {#each Array.from({ length: api.contentCount }) as _, index}
          <div {...api.getContentProps({ index })}>
            {#each marqueeBrands as brand}
              <div {...api.getItemProps()}>
                <span class="wordmark">{brand}</span>
              </div>
            {/each}
          </div>
        {/each}
      </div>

      <div {...api.getEdgeProps({ side: "end" })}></div>
    </div>
    <p class="hint">The logos repeat to fill the full width.</p>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
