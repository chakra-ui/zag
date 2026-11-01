<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import SliderPriceSlider from "#lib/components/slider-price-slider.svelte"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"
  import "@styles/popover.css"

  const id = $props.id()
  const service = useMachine(popover.machine, { id })
  const api = $derived(popover.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()}>Filters</button>
  {#if api.open}
    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <SliderPriceSlider />
        </div>
      </div>
    </Portal>
  {/if}
</main>
