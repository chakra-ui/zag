import { Portal, mergeProps, normalizeProps, useMachine } from "@zag-js/preact"
import * as slider from "@zag-js/slider"
import * as tooltip from "@zag-js/tooltip"
import { useId } from "react"
import "@styles/slider.css"
import "@styles/tooltip.css"

export default function Page() {
  const sliderService = useMachine(slider.machine, {
    id: useId(),
    name: "opacity",
    defaultValue: [60],
    thumbSize: 20,
  })

  const sliderApi = slider.connect(sliderService, normalizeProps)

  const tooltipService = useMachine(tooltip.machine, {
    id: useId(),
    open: sliderApi.focused || sliderApi.dragging,
    positioning: { placement: "top" },
  })

  const tooltipApi = tooltip.connect(tooltipService, normalizeProps)

  return (
    <main>
      <div {...sliderApi.getRootProps()}>
        <label {...sliderApi.getLabelProps()}>Opacity</label>
        <div {...sliderApi.getControlProps()}>
          <div {...sliderApi.getTrackProps()}>
            <div {...sliderApi.getRangeProps()} />
          </div>
          <div {...mergeProps(tooltipApi.getTriggerProps(), sliderApi.getThumbProps({ index: 0 }))}>
            <input {...sliderApi.getHiddenInputProps({ index: 0 })} />
          </div>
        </div>
      </div>
      {tooltipApi.open && (
        <Portal>
          <div {...tooltipApi.getPositionerProps()}>
            <div {...tooltipApi.getContentProps()}>{sliderApi.value[0]}%</div>
          </div>
        </Portal>
      )}
    </main>
  )
}
