<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as slider from "@zag-js/slider"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import "@styles/slider.css"
  import "@styles/tooltip.css"

  const id = $props.id()
  const sliderService = useMachine(slider.machine, {
    id,
    name: "opacity",
    defaultValue: [60],
    thumbSize: 20,
  })

  const sliderApi = $derived(slider.connect(sliderService, normalizeProps))

  const tooltipService = useMachine(tooltip.machine, () => ({
    id: `${id}-tooltip`,
    open: sliderApi.focused || sliderApi.dragging,
    positioning: { placement: "top" as const },
  }))

  const tooltipApi = $derived(tooltip.connect(tooltipService, normalizeProps))
</script>

<main>
  <div {...sliderApi.getRootProps()}>
    <label {...sliderApi.getLabelProps()}>Opacity</label>
    <div {...sliderApi.getControlProps()}>
      <div {...sliderApi.getTrackProps()}>
        <div {...sliderApi.getRangeProps()}></div>
      </div>
      <div {...mergeProps(tooltipApi.getTriggerProps(), sliderApi.getThumbProps({ index: 0 }))}>
        <input {...sliderApi.getHiddenInputProps({ index: 0 })} />
      </div>
    </div>
  </div>
  {#if tooltipApi.open}
    <Portal>
      <div {...tooltipApi.getPositionerProps()}>
        <div {...tooltipApi.getContentProps()}>{sliderApi.value[0]}%</div>
      </div>
    </Portal>
  {/if}
</main>
