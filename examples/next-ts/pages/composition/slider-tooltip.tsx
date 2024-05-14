import { Portal, mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import * as tooltip from "@zag-js/tooltip"
import { useId } from "react"

export default function Page() {
  const [sliderState, sliderSend] = useMachine(
    slider.machine({
      id: useId(),
      name: "quantity",
      thumbSize: { width: 20, height: 20 },
      ids: {
        thumb(index) {
          return `thumb-${index}`
        },
      },
    }),
  )

  const sliderApi = slider.connect(sliderState, sliderSend, normalizeProps)

  const [tooltipState, tooltipSend] = useMachine(
    tooltip.machine({
      id: useId(),
      ids: { trigger: "thumb-0" },
    }),
    {
      context: {
        open: sliderApi.dragging,
        "open.controlled": true,
      },
    },
  )

  const tooltipApi = tooltip.connect(tooltipState, tooltipSend, normalizeProps)

  return (
    <main className="slider">
      <div {...sliderApi.rootProps}>
        <div {...sliderApi.controlProps}>
          <div {...sliderApi.trackProps}>
            <div {...sliderApi.rangeProps} />
          </div>
          <div {...mergeProps(tooltipApi.triggerProps, sliderApi.getThumbProps({ index: 0 }))} />
          {tooltipApi.open && (
            <Portal>
              <div {...tooltipApi.positionerProps}>
                <div {...tooltipApi.contentProps}>{sliderApi.value[0]}</div>
              </div>
            </Portal>
          )}
        </div>
      </div>
    </main>
  )
}
