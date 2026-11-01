import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/preact"
import * as slider from "@zag-js/slider"
import { useId } from "react"
import "@styles/slider.css"
import "@styles/popover.css"

function PriceSlider() {
  const service = useMachine(slider.machine, {
    id: useId(),
    name: "price",
    defaultValue: [20, 60],
    thumbSize: 20,
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Price</label>
      <output {...api.getValueTextProps()}>{api.value.join(" – ")}</output>
      <div {...api.getControlProps()}>
        <div {...api.getTrackProps()}>
          <div {...api.getRangeProps()} />
        </div>
        {api.value.map((_, index) => (
          <div key={index} {...api.getThumbProps({ index })}>
            <input {...api.getHiddenInputProps({ index })} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Page() {
  const service = useMachine(popover.machine, { id: useId() })
  const api = popover.connect(service, normalizeProps)

  return (
    <main>
      <button {...api.getTriggerProps()}>Filters</button>
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <PriceSlider />
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
