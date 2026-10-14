<script lang="ts">
  import CarouselInDialog from "$lib/components/carousel-in-dialog.svelte"
  import Portal from "$lib/components/portal.svelte"
  import Presence from "$lib/components/presence.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/carousel.css"
  import "@styles/dialog.css"

  const SLIDE_COUNT = 30

  let page = $state(0)

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()} data-testid="open-dialog">Open Carousel in Dialog</button>

  <Portal>
    <Presence {...api.getBackdropProps()} />
    <div {...api.getPositionerProps()}>
      <Presence {...api.getContentProps()}>
        <h2 {...api.getTitleProps()}>Carousel in Dialog</h2>
        <p {...api.getDescriptionProps()}>Navigate past page 10 to test the fix.</p>
        <CarouselInDialog count={SLIDE_COUNT} {page} onPageChange={(p) => (page = p)} />
        <button {...api.getCloseTriggerProps()} data-testid="close-dialog">
          <XIcon />
        </button>
      </Presence>
    </div>
  </Portal>
</main>
