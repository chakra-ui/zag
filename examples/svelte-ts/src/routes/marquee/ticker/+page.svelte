<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as marquee from "@zag-js/marquee"
  import { marqueeQuotes } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/marquee.css"

  let paused = $state(false)
  let finished = $state(false)

  const id = $props.id()
  const service = useMachine(marquee.machine, (): marquee.Props => ({
    id,
    speed: 200,
    spacing: "2rem",
    loopCount: 2,
    pauseOnInteraction: true,
    paused,
    onPauseChange: (details) => (paused = details.paused),
    onComplete: () => (finished = true),
  }))

  const api = $derived(marquee.connect(service, normalizeProps))
</script>

<main>
  <div class="ticker">
    <div {...api.getRootProps()}>
      <div {...api.getViewportProps()}>
        {#each Array.from({ length: api.contentCount }) as _, index}
          <div {...api.getContentProps({ index })}>
            {#each marqueeQuotes as quote}
              <div {...api.getItemProps()}>
                <span class="symbol">{quote.symbol}</span>
                <span>{quote.price}</span>
                <span class={quote.trend === "up" ? "up" : "down"}>{quote.change}</span>
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>

    <div class="controls">
      <button onclick={() => (paused = !paused)}>{paused ? "Resume" : "Pause"}</button>
      <span class="status" role="status">{finished ? "Finished" : ""}</span>
    </div>
    <p class="hint">Press Pause or hover to stop; it ends after two loops.</p>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
