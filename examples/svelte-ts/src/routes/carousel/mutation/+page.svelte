<script lang="ts">
  import * as carousel from "@zag-js/carousel"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/carousel.css"

  let slides = $state([1, 2, 3, 4])

  const id = $props.id()
  const service = useMachine(carousel.machine, (): carousel.Props => ({
    id,
    count: slides.length,
    slidesPerPage: 2,
    spacing: "16px",
  }))

  const api = $derived(carousel.connect(service, normalizeProps))
</script>

<main>
  <div class="carousel">
    <div {...api.getRootProps()}>
      <div class="carousel-toolbar">
        <button onclick={() => (slides = [...slides, Math.max(0, ...slides) + 1])}>Add slide</button>
        <button disabled={slides.length <= 1} onclick={() => (slides = slides.slice(0, -1))}>Remove slide</button>
      </div>

      <div {...api.getControlProps()}>
        <button {...api.getPreviousTriggerProps()}><ChevronLeftIcon /></button>
        <div {...api.getItemGroupProps()}>
          {#each slides as slide, index (slide)}
            <div {...api.getItemProps({ index })}>
              <div class="carousel-card">{slide}</div>
            </div>
          {/each}
        </div>
        <button {...api.getNextTriggerProps()}><ChevronRightIcon /></button>
      </div>

      <div class="carousel-footer">
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
