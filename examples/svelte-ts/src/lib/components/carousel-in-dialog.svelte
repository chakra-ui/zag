<script lang="ts">
  import * as carousel from "@zag-js/carousel"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    count: number
    page: number
    onPageChange: (page: number) => void
  }

  const props: Props = $props()

  const id = $props.id()
  const service = useMachine(carousel.machine, () => ({
    id,
    count: props.count,
    page: props.page,
    onPageChange({ page }) {
      props.onPageChange(page)
    },
  }))
  const api = $derived(carousel.connect(service, normalizeProps))
</script>

<div class="carousel">
  <div {...api.getRootProps()}>
    <div {...api.getControlProps()}>
      <button {...api.getPrevTriggerProps()}>Prev</button>
      <button {...api.getNextTriggerProps()}>Next</button>
    </div>

    <div {...api.getItemGroupProps()}>
      {#each Array.from({ length: props.count }) as _, i}
        <div {...api.getItemProps({ index: i })}>
          <img src={`https://picsum.photos/seed/slide-${i}/300/200`} alt={`Slide ${i}`} style="width: 100%" />
        </div>
      {/each}
    </div>

    <div {...api.getIndicatorGroupProps()}>
      {#each api.pageSnapPoints as _, index}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button {...api.getIndicatorProps({ index })}></button>
      {/each}
    </div>

    <p data-testid="page-display">Current page: {api.page}</p>
  </div>
</div>
