<script lang="ts">
  import * as carousel from "@zag-js/carousel"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/carousel.css"

  const photos = [
    { width: 300, height: 400 },
    { width: 600, height: 400 },
    { width: 400, height: 400 },
    { width: 320, height: 400 },
    { width: 640, height: 400 },
    { width: 400, height: 400 },
    { width: 300, height: 400 },
  ].map((size, index) => ({
    ...size,
    src: `https://picsum.photos/seed/zag-strip-${index}/${size.width}/${size.height}`,
  }))

  const id = $props.id()

  const photoService = useMachine(carousel.machine, {
    id: `${id}-photos`,
    count: photos.length,
    autoSize: true,
    spacing: "8px",
    allowMouseDrag: true,
  })
  const photoApi = $derived(carousel.connect(photoService, normalizeProps))
</script>

<main>
  <div class="carousel">
    <div {...photoApi.getRootProps()} class="carousel-strip">
      <div {...photoApi.getControlProps()}>
        <button {...photoApi.getPreviousTriggerProps()}><ChevronLeftIcon /></button>
        <div {...photoApi.getItemGroupProps()}>
          {#each photos as photo, index (photo.src)}
            <div {...photoApi.getItemProps({ index })}>
              <img src={photo.src} width={photo.width} height={photo.height} alt="" />
            </div>
          {/each}
        </div>
        <button {...photoApi.getNextTriggerProps()}><ChevronRightIcon /></button>
      </div>
    </div>
  </div>
</main>
