<script lang="ts">
  import * as carousel from "@zag-js/carousel"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/carousel.css"

  const items = Array.from({ length: 10 }, (_, index) => index)

  const THUMBNAIL_SLIDES_PER_PAGE = 6.75

  const id = $props.id()

  const mainService = useMachine(carousel.machine, {
    id: `${id}-main`,
    count: items.length,
    slidesPerPage: 1,
    onPageChange(details) {
      const index = Math.floor((details.page + 1) / THUMBNAIL_SLIDES_PER_PAGE)
      thumbnailApi.scrollTo(index)
    },
  })
  const mainApi = $derived(carousel.connect(mainService, normalizeProps))

  const thumbnailService = useMachine(carousel.machine, {
    id: `${id}-thumbnail`,
    count: items.length,
    slidesPerPage: THUMBNAIL_SLIDES_PER_PAGE,
    spacing: "12px",
  })
  const thumbnailApi = $derived(carousel.connect(thumbnailService, normalizeProps))
</script>

<main>
  <div {...mainApi.getRootProps()}>
    <div {...mainApi.getControlProps()}>
      <button {...mainApi.getPrevTriggerProps()}>Prev</button>
      <button {...mainApi.getNextTriggerProps()}>Next</button>
    </div>
    <div {...mainApi.getItemGroupProps()}>
      {#each items as index}
        <div {...mainApi.getItemProps({ index })}>
          {index + 1}
        </div>
      {/each}
    </div>
    <div {...thumbnailApi.getRootProps()}>
      <div {...thumbnailApi.getItemGroupProps()}>
        {#each items as index}
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <div {...thumbnailApi.getItemProps({ index })} onclick={() => mainApi.scrollToIndex(index)}>
            {index + 1}
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>
