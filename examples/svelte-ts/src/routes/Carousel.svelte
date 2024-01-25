<script lang="ts">
  import Toolbar from "$lib/components/Toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as carousel from "@zag-js/carousel"
  import { carouselControls, carouselData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(carouselControls)

  const machine = useMachine(carousel.machine({ id: "1", index: 0, spacing: "20px", slidesPerView: 2 }), {
    // context: controls.context,
  })

  const api = $derived(carousel.connect(machine.state, machine.send, normalizeProps))
</script>

<main class="carousel">
  <div {...api.rootProps}>
    <button {...api.prevTriggerProps}>Prev</button>
    <button {...api.nextTriggerProps}>Next</button>
    <div {...api.viewportProps}>
      <div {...api.itemGroupProps}>
        {#each carouselData as image, index}
          <div {...api.getItemProps({ index })}>
            <img src={image} alt="" style="height:300px;width:100%;object-fit:cover;" />
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar {controls} {machine} />
