<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as marquee from "@zag-js/marquee"
  import { marqueeTestimonials } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/marquee.css"

  const id = $props.id()
  const service = useMachine(marquee.machine, {
    id,
    side: "bottom",
    pauseOnInteraction: true,
  })

  const api = $derived(marquee.connect(service, normalizeProps))
</script>

<main>
  <div class="testimonials">
    <div {...api.getRootProps()}>
      <div {...api.getEdgeProps({ side: "top" })}></div>

      <div {...api.getViewportProps()}>
        {#each Array.from({ length: api.contentCount }) as _, index}
          <div {...api.getContentProps({ index })}>
            {#each marqueeTestimonials as item}
              <figure {...api.getItemProps()}>
                <blockquote class="quote">{item.quote}</blockquote>
                <figcaption class="author">
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </figcaption>
              </figure>
            {/each}
          </div>
        {/each}
      </div>

      <div {...api.getEdgeProps({ side: "bottom" })}></div>
    </div>
    <p class="hint">Hover a testimonial to pause the scroll.</p>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
