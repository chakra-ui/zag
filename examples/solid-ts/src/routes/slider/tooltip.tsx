import * as slider from "@zag-js/slider"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/slider.css"
import "@styles/tooltip.css"

export default function Page() {
  const sliderService = useMachine(slider.machine, {
    id: createUniqueId(),
    name: "opacity",
    defaultValue: [60],
    thumbSize: 20,
  })

  const sliderApi = createMemo(() => slider.connect(sliderService, normalizeProps))

  const tooltipId = createUniqueId()
  const tooltipService = useMachine(tooltip.machine, () => ({
    id: tooltipId,
    open: sliderApi().focused || sliderApi().dragging,
    positioning: { placement: "top" as const },
  }))

  const tooltipApi = createMemo(() => tooltip.connect(tooltipService, normalizeProps))

  return (
    <main>
      <div {...sliderApi().getRootProps()}>
        <label {...sliderApi().getLabelProps()}>Opacity</label>
        <div {...sliderApi().getControlProps()}>
          <div {...sliderApi().getTrackProps()}>
            <div {...sliderApi().getRangeProps()} />
          </div>
          <div {...mergeProps(tooltipApi().getTriggerProps(), sliderApi().getThumbProps({ index: 0 }))}>
            <input {...sliderApi().getHiddenInputProps({ index: 0 })} />
          </div>
        </div>
      </div>
      <Show when={tooltipApi().open}>
        <Portal>
          <div {...tooltipApi().getPositionerProps()}>
            <div {...tooltipApi().getContentProps()}>{sliderApi().value[0]}%</div>
          </div>
        </Portal>
      </Show>
    </main>
  )
}
