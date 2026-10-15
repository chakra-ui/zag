<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as carousel from "@zag-js/carousel"
  import { carouselControls, carouselData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "lucide-svelte"
  import "@styles/carousel.css"

  const controls = useControls(carouselControls)

  const id = $props.id()
  const service = useMachine(
    carousel.machine,
    controls.mergeProps<carousel.Props>({
      id,
      spacing: "16px",
      slidesPerPage: 2,
      count: carouselData.length,
      allowMouseDrag: true,
    }),
  )

  const api = $derived(carousel.connect(service, normalizeProps))
</script>

<main>
  <div class="carousel">
    <div {...api.getRootProps()}>
      <div class="carousel-toolbar">
        <button onclick={() => api.scrollToIndex(4)}>Scroll to 4</button>
      </div>

      <div {...api.getControlProps()}>
        <button {...api.getPrevTriggerProps()}><ChevronLeftIcon /></button>
        <div {...api.getItemGroupProps()}>
          {#each carouselData as image, index (image)}
            <div {...api.getItemProps({ index })} class="carousel-photo">
              <img src={image} alt="" />
            </div>
          {/each}
        </div>
        <button {...api.getNextTriggerProps()}><ChevronRightIcon /></button>
      </div>

      <div class="carousel-footer">
        <button {...api.getAutoplayTriggerProps()}>
          {#if api.isPlaying}<PauseIcon />{:else}<PlayIcon />{/if}
          <span class="sr-only">{api.isPlaying ? "Stop" : "Play"}</span>
        </button>
        <div {...api.getIndicatorGroupProps()}>
          {#each api.pageSnapPoints as _, index}
            <button {...api.getIndicatorProps({ index })}></button>
          {/each}
        </div>
        <span {...api.getProgressTextProps()}>{api.getProgressText()}</span>
      </div>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} omit={["translations"]} />
</Toolbar>
