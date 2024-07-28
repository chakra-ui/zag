import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import { useId, useState } from "react"
import { flushSync } from "react-dom"

export default function Page() {
  const [value, setValue] = useState([50])
  const [endValue, setEndValue] = useState([50])

  const [state, send] = useMachine(
    slider.machine({
      id: useId(),
      name: "quantity",
      onValueChange(details) {
        flushSync(() => {
          setValue(details.value)
        })
      },
      onValueChangeEnd(details) {
        flushSync(() => {
          setEndValue(details.value)
        })
      },
    }),
    {
      context: {
        value,
      },
    },
  )

  const api = slider.connect(state, send, normalizeProps)

  return (
    <main>
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()}>
          <div data-testid="track" {...api.getTrackProps()}>
            <div {...api.getRangeProps()} />
          </div>
          {api.value.map((_, index) => (
            <div key={index} {...api.getThumbProps({ index })}>
              <input {...api.getHiddenInputProps({ index })} />
            </div>
          ))}
        </div>

        <div>
          <output>Change: {value[0]}</output>
          <output>Change end: {endValue[0]}</output>
        </div>
      </div>
    </main>
  )
}
