<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as slider from "@zag-js/slider"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import "@styles/slider.css"
  import "@styles/tooltip.css"

  const id = $props.id()
  const sliderService = useMachine(slider.machine, {
    id,
    name: "quantity",
    thumbSize: 20,
    ids: {
      thumb(index) {
        return `thumb-${index}`
      },
    },
  })

  const sliderApi = $derived(slider.connect(sliderService, normalizeProps))

  const tooltipService = useMachine(tooltip.machine, () => ({
    id: `${id}-tooltip`,
    ids: { trigger: "thumb-0" },
    open: sliderApi.dragging,
  }))

  const tooltipApi = $derived(tooltip.connect(tooltipService, normalizeProps))
</script>

<main class="slider">
  <div {...sliderApi.getRootProps()}>
    <div {...sliderApi.getControlProps()}>
      <div {...sliderApi.getTrackProps()}>
        <div {...sliderApi.getRangeProps()}></div>
      </div>
      <div {...mergeProps(tooltipApi.getTriggerProps(), sliderApi.getThumbProps({ index: 0 }))}></div>
      {#if tooltipApi.open}
        <Portal>
          <div {...tooltipApi.getPositionerProps()}>
            <div {...tooltipApi.getContentProps()}>{sliderApi.value[0]}</div>
          </div>
        </Portal>
      {/if}
    </div>
  </div>
</main>
