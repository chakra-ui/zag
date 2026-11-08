import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useRef, useState } from "preact/hooks"
import "@styles/color-picker.css"

export default function Page() {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const service = useMachine(colorPicker.machine, {
    id: useId(),
    defaultValue: colorPicker.parse("#a855f7"),
    open,
    onOpenChange: (details) => setOpen(details.open),
    onInteractOutside(event) {
      if (toggleRef.current?.contains(event.detail.target as Node)) event.preventDefault()
    },
  })

  const api = colorPicker.connect(service, normalizeProps)

  return (
    <main className="color-picker">
      <p style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button ref={toggleRef} type="button" onClick={() => setOpen(!open)}>
          {open ? "Close picker" : "Open picker"}
        </button>
        <span>
          Open: <output aria-label="Open state">{String(open)}</output>
        </span>
      </p>

      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Accent color</label>

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
    </main>
  )
}
