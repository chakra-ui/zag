<script lang="ts">
  import * as carousel from "@zag-js/carousel"
  import { events, normalizeProps, useMachine } from "@zag-js/svelte"
  import { carouselControls, carouselData } from "@zag-js/shared"
  import StateVisualizer from "../../components/state-visualizer.svelte"
  import Toolbar from "../../components/toolbar.svelte"
  import { ControlsUI, useControls } from "../../stores/controls"

  const [context, defaultValues] = useControls(carouselControls)
  $: $context = defaultValues

  const [state, send] = useMachine(carousel.machine({ id: "carousel" }), {
    context,
  })

  $: api = carousel.connect($state, send, normalizeProps)
</script>

<main class="carousel">
  <div {...api.rootProps.attrs} use:events={api.rootProps.handlers}>
    <button {...api.prevTriggerProps.attrs} use:events={api.prevTriggerProps.handlers}>Prev</button>
    <button {...api.nextTriggerProps.attrs} use:events={api.nextTriggerProps.handlers}>Next</button>
    <div {...api.viewportProps.attrs} use:events={api.viewportProps.handlers}>
      <div {...api.slideGroupProps.attrs} use:events={api.slideGroupProps.handlers}>
        {#each carouselData as image, index}
          <div {...api.getSlideProps({ index }).attrs} use:events={api.getSlideProps({ index }).handlers}>
            <img src={image} alt="" style="height:300px; width:100%; object-fit: cover" />
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <ControlsUI slot="controls" {context} controls={carouselControls} />
  <StateVisualizer state={$state} />
</Toolbar>
