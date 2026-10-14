<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as carousel from "@zag-js/carousel"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/carousel.css"

  let index = $state(0)
  let images = $state([0, 1, 2, 3, 4])

  const id = $props.id()
  const service = useMachine(carousel.machine, () => ({
    id,
    count: images.length,
    loop: true,
    autoPlay: { delay: 1000 },
    onPageChange: ({ page }) => (index = page),
    page: index,
  }))

  const api = $derived(carousel.connect(service, normalizeProps))

  const onAdd = () => {
    const max = Math.max(...images)
    images = [...images, max + 1]
  }
</script>

<main class="carousel">
  <div {...api.getRootProps()}>
    <div {...api.getControlProps()}>
      <button {...api.getAutoplayTriggerProps()}>{api.isPlaying ? "Stop" : "Play"}</button>
      <div class="carousel-spacer"></div>
      <button {...api.getPrevTriggerProps()}>&laquo;</button>
      <button {...api.getNextTriggerProps()}>&raquo;</button>
    </div>

    <div {...api.getIndicatorGroupProps()}>
      {#each api.pageSnapPoints as _, i}
        <button {...api.getIndicatorProps({ index: i })}>
          {i}
        </button>
      {/each}
    </div>

    <div {...api.getItemGroupProps()}>
      {#each images as image, index (image)}
        <div {...api.getItemProps({ index })}>
          <div
            style="width: 188px; height: 188px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center"
          >
            Slide {image}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <p>
    <button onclick={onAdd}>add slide</button>
  </p>
</main>

<Toolbar>
  <StateVisualizer state={service} omit={["translations"]} />
</Toolbar>
