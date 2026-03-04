<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as carousel from "@zag-js/carousel"
  import { carouselControls, carouselData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(carouselControls)

  const id = $props.id()
  const service = useMachine(
    carousel.machine,
    controls.mergeProps<carousel.Props>({
      id,
      spacing: "20px",
      slidesPerPage: 2,
      slideCount: carouselData.length,
      allowMouseDrag: true,
    }),
  )

  const api = $derived(carousel.connect(service, normalizeProps))
</script>

<main class="carousel">
  <div {...api.getRootProps()}>
    <button onclick={() => api.scrollToIndex(4)}>Scroll to 4</button>
    <div {...api.getControlProps()}>
      <button {...api.getAutoplayTriggerProps()}>{api.isPlaying ? "Stop" : "Play"}</button>
      <div class="carousel-spacer"></div>
      <button {...api.getPrevTriggerProps()}>Prev</button>
      <button {...api.getNextTriggerProps()}>Next</button>
    </div>

    <div {...api.getItemGroupProps()}>
      {#each carouselData as image, index}
        <div {...api.getItemProps({ index })}>
          <img src={image} alt="" />
        </div>
      {/each}
    </div>
    <div {...api.getIndicatorGroupProps()}>
      {#each api.pageSnapPoints as _, index}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button {...api.getIndicatorProps({ index })}></button>
      {/each}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
