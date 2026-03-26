import * as popover from "@zag-js/popover"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import { Fragment } from "react"

function RangeSlider() {
  const service = useMachine(slider.machine, {
    id: "1",
    name: "quantity",
    defaultValue: [10, 60],
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <div className="slider">
      <div {...mergeProps(api.getRootProps())}>
        <div>
          <label {...api.getLabelProps()}>Quantity:</label>
          <output {...api.getValueTextProps()}>{api.value.join(" - ")}</output>
        </div>
        <div className="control-area">
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
      </div>
    </div>
  )
}

export default function Page() {
  const service = useMachine(popover.machine, {
    id: "2",
    modal: true,
  })

  const api = popover.connect(service, normalizeProps)

  const Wrapper = api.portalled ? Portal : Fragment

  return (
    <main className="popover">
      <div data-part="root">
        <button data-testid="button-before">Button :before</button>

        <button data-testid="popover-trigger" {...api.getTriggerProps()}>
          Click me
          <div {...api.getIndicatorProps()}>{">"}</div>
        </button>

        <div {...api.getAnchorProps()}>anchor</div>

        <Wrapper>
          <div {...api.getPositionerProps()}>
            <div data-testid="popover-content" className="popover-content" {...api.getContentProps()}>
              <RangeSlider />
            </div>
          </div>
        </Wrapper>
        <span data-testid="plain-text">I am just text</span>
        <button data-testid="button-after">Button :after</button>
      </div>
    </main>
  )
}
