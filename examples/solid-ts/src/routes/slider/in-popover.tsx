import * as popover from "@zag-js/popover"
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/slider.css"
import "@styles/popover.css"

function RangeSlider() {
  const service = useMachine(slider.machine, {
    thumbSize: 20,
    id: "1",
    name: "quantity",
    defaultValue: [10, 60],
  })

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <div class="slider">
      <div {...api().getRootProps()}>
        <div>
          <label {...api().getLabelProps()}>Quantity:</label>
          <output {...api().getValueTextProps()}>{api().value.join(" - ")}</output>
        </div>
        <div class="control-area">
          <div {...api().getControlProps()}>
            <div {...api().getTrackProps()}>
              <div {...api().getRangeProps()} />
            </div>
            <Index each={api().value}>
              {(_, index) => (
                <div {...api().getThumbProps({ index })}>
                  <input {...api().getHiddenInputProps({ index })} />
                </div>
              )}
            </Index>
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

  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <main class="popover">
      <div data-part="root">
        <button data-testid="button-before">Button :before</button>

        <button data-testid="popover-trigger" {...api().getTriggerProps()}>
          Click me
          <div {...api().getIndicatorProps()}>{">"}</div>
        </button>

        <div {...api().getAnchorProps()}>anchor</div>

        <Portal>
          <div {...api().getPositionerProps()}>
            <div data-testid="popover-content" class="popover-content" {...api().getContentProps()}>
              <RangeSlider />
            </div>
          </div>
        </Portal>
        <span data-testid="plain-text">I am just text</span>
        <button data-testid="button-after">Button :after</button>
      </div>
    </main>
  )
}
