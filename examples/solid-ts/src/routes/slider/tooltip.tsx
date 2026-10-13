import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as slider from "@zag-js/slider"
import * as tooltip from "@zag-js/tooltip"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/slider.css"
import "@styles/tooltip.css"

export default function Page() {
  const sliderService = useMachine(slider.machine, {
    id: createUniqueId(),
    name: "quantity",
    thumbSize: 20,
    ids: {
      thumb(index) {
        return `thumb-${index}`
      },
    },
  })

  const sliderApi = createMemo(() => slider.connect(sliderService, normalizeProps))

  const tooltipId = createUniqueId()
  const tooltipService = useMachine(tooltip.machine, () => ({
    id: tooltipId,
    ids: { trigger: "thumb-0" },
    open: sliderApi().dragging,
  }))

  const tooltipApi = createMemo(() => tooltip.connect(tooltipService, normalizeProps))

  return (
    <main class="slider">
      <div {...sliderApi().getRootProps()}>
        <div {...sliderApi().getControlProps()}>
          <div {...sliderApi().getTrackProps()}>
            <div {...sliderApi().getRangeProps()} />
          </div>
          <div {...mergeProps(tooltipApi().getTriggerProps(), sliderApi().getThumbProps({ index: 0 }))} />
          <Show when={tooltipApi().open}>
            <Portal>
              <div {...tooltipApi().getPositionerProps()}>
                <div {...tooltipApi().getContentProps()}>{sliderApi().value[0]}</div>
              </div>
            </Portal>
          </Show>
        </div>
      </div>
    </main>
  )
}
