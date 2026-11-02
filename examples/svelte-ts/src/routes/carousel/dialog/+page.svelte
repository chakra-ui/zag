<script lang="ts">
  import CarouselInDialog from "#lib/components/carousel-in-dialog.svelte"
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/carousel.css"
  import "@styles/dialog.css"

  const images = Array.from({ length: 12 }, (_, index) => `https://picsum.photos/seed/zag-product-${index}/800/500`)

  let page = $state(0)

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()} data-testid="open-dialog">View product images</button>

  <Portal>
    <Presence {...api.getBackdropProps()} />
    <div {...api.getPositionerProps()}>
      <Presence {...api.getContentProps()} class="carousel">
        <h2 {...api.getTitleProps()}>Product images</h2>
        <p {...api.getDescriptionProps()}>Use the arrows or swipe to browse.</p>
        <CarouselInDialog {images} {page} onPageChange={(p) => (page = p)} />
        <button {...api.getCloseTriggerProps()} data-testid="close-dialog">
          <XIcon />
        </button>
      </Presence>
    </div>
  </Portal>
</main>
