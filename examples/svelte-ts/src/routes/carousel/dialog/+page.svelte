<script lang="ts">
  import Presence from "$lib/components/presence.svelte"
  import * as carousel from "@zag-js/carousel"
  import * as dialog from "@zag-js/dialog"
  import Portal from "$lib/components/portal.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const SLIDE_COUNT = 30

  const id = $props.id()

  let page = $state(0)

  const dialogService = useMachine(dialog.machine, { id })
  const dialogApi = $derived(dialog.connect(dialogService, normalizeProps))

  const carouselService = useMachine(carousel.machine, () => ({
    id: `${id}-carousel`,
    count: SLIDE_COUNT,
    page,
    onPageChange(details: { page: number }) {
      page = details.page
    },
  }))
  const carouselApi = $derived(carousel.connect(carouselService, normalizeProps))
</script>

<main>
  <button {...dialogApi.getTriggerProps()} data-testid="open-dialog"> Open Carousel in Dialog </button>

  <Portal>
    <Presence {...dialogApi.getBackdropProps()} />
    <div {...dialogApi.getPositionerProps()}>
      <Presence {...dialogApi.getContentProps()}>
        <h2 {...dialogApi.getTitleProps()}>Carousel in Dialog</h2>
        <p {...dialogApi.getDescriptionProps()}>Navigate past page 10 to test the fix.</p>

        <div class="carousel">
          <div {...carouselApi.getRootProps()}>
            <div {...carouselApi.getControlProps()}>
              <button {...carouselApi.getPrevTriggerProps()}>Prev</button>
              <button {...carouselApi.getNextTriggerProps()}>Next</button>
            </div>

            <div {...carouselApi.getItemGroupProps()}>
              {#each Array.from({ length: SLIDE_COUNT }) as _, index}
                <div {...carouselApi.getItemProps({ index })}>
                  <img
                    src={`https://picsum.photos/seed/slide-${index}/300/200`}
                    alt={`Slide ${index}`}
                    style="width: 100%"
                  />
                </div>
              {/each}
            </div>

            <div {...carouselApi.getIndicatorGroupProps()}>
              {#each carouselApi.pageSnapPoints as _, index}
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button {...carouselApi.getIndicatorProps({ index })}></button>
              {/each}
            </div>

            <p data-testid="page-display">Current page: {carouselApi.page}</p>
          </div>
        </div>

        <button {...dialogApi.getCloseTriggerProps()} data-testid="close-dialog"> Close </button>
      </Presence>
    </div>
  </Portal>
</main>
