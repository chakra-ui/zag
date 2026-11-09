import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useState } from "preact/hooks"
import "@styles/color-picker.css"

export default function Page() {
  const [submitted, setSubmitted] = useState("")

  const service = useMachine(colorPicker.machine, {
    id: useId(),
    name: "color",
    required: true,
    defaultValue: colorPicker.parse("#3b82f6"),
  })

  const api = colorPicker.connect(service, normalizeProps)

  return (
    <main className="color-picker">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)
          setSubmitted(String(formData.get("color")))
        }}
        onReset={() => setSubmitted("")}
      >
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Background color</label>
          <input {...api.getHiddenInputProps()} />

          <div {...api.getControlProps()}>
            <button {...api.getTriggerProps()}>
              <div {...api.getTransparencyGridProps({ size: "10px" })} />
              <div {...api.getSwatchProps({ value: api.value })} />
            </button>
            <input {...api.getChannelInputProps({ channel: "hex" })} />
          </div>

          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div className="content__inner">
                <div {...api.getAreaProps()}>
                  <div {...api.getAreaBackgroundProps()} />
                  <div {...api.getAreaThumbProps()} />
                </div>

                <div {...api.getChannelSliderProps({ channel: "hue" })}>
                  <div {...api.getChannelSliderTrackProps({ channel: "hue" })} />
                  <div {...api.getChannelSliderThumbProps({ channel: "hue" })} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </div>

        <p>
          Submitted: <output aria-label="Submitted value">{submitted}</output>
        </p>
      </form>
    </main>
  )
}
