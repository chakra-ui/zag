<script lang="ts">
  import * as carousel from "@zag-js/carousel"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"

  interface Props {
    images: string[]
    page: number
    onPageChange: (page: number) => void
  }

  const props: Props = $props()

  const id = $props.id()
  const service = useMachine(carousel.machine, () => ({
    id,
    count: props.images.length,
    page: props.page,
    onPageChange({ page }) {
      props.onPageChange(page)
    },
  }))
  const api = $derived(carousel.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <div {...api.getControlProps()}>
    <button {...api.getPreviousTriggerProps()}><ChevronLeftIcon /></button>
    <div {...api.getItemGroupProps()}>
      {#each props.images as src, index (src)}
        <div {...api.getItemProps({ index })} class="carousel-photo">
          <img {src} alt={`Product image ${index + 1}`} />
        </div>
      {/each}
    </div>
    <button {...api.getNextTriggerProps()}><ChevronRightIcon /></button>
  </div>
  <span {...api.getProgressTextProps()} data-testid="page-display">{api.getProgressText()}</span>
</div>
