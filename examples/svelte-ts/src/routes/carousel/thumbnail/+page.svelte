<script lang="ts">
  import * as carousel from "@zag-js/carousel"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/carousel.css"

  const images = Array.from({ length: 8 }, (_, index) => `https://picsum.photos/seed/zag-gallery-${index}/800/500`)

  const id = $props.id()

  const mainService = useMachine(carousel.machine, {
    id: `${id}-main`,
    count: images.length,
    slidesPerPage: 1,
    onPageChange: (details) => thumbnails.scrollToIndex(details.page),
  })
  const main = $derived(carousel.connect(mainService, normalizeProps))

  const thumbnailService = useMachine(carousel.machine, {
    id: `${id}-thumbnails`,
    count: images.length,
    // The cut-off sixth thumbnail shows the strip scrolls
    slidesPerPage: 5.5,
    spacing: "8px",
  })
  const thumbnails = $derived(carousel.connect(thumbnailService, normalizeProps))
</script>

<main>
  <div class="carousel">
    <div {...main.getRootProps()}>
      <div {...main.getControlProps()}>
        <button {...main.getPrevTriggerProps()}><ChevronLeftIcon /></button>
        <div {...main.getItemGroupProps()}>
          {#each images as src, index (src)}
            <div {...main.getItemProps({ index })} class="carousel-photo">
              <img {src} alt={`Photo ${index + 1}`} />
            </div>
          {/each}
        </div>
        <button {...main.getNextTriggerProps()}><ChevronRightIcon /></button>
      </div>

      <div {...thumbnails.getRootProps()} class="carousel-thumbnails">
        <div {...thumbnails.getItemGroupProps()}>
          {#each images as src, index (src)}
            <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
            <div
              {...thumbnails.getItemProps({ index })}
              data-selected={main.page === index || undefined}
              onclick={() => main.scrollToIndex(index)}
            >
              <img {src} alt="" />
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</main>
