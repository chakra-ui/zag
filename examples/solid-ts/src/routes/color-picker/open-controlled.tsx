import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/color-picker.css"

export default function Page() {
  const [open, setOpen] = createSignal(false)
  let toggleRef: HTMLButtonElement | undefined

  const id = createUniqueId()
  const service = useMachine(colorPicker.machine, () => ({
    id,
    defaultValue: colorPicker.parse("#a855f7"),
    open: open(),
    onOpenChange: (details) => setOpen(details.open),
    onInteractOutside(event) {
      if (toggleRef?.contains(event.detail.target as Node)) event.preventDefault()
    },
  }))

  const api = createMemo(() => colorPicker.connect(service, normalizeProps))

  return (
    <main class="color-picker">
      <p style={{ display: "flex", gap: "12px", "align-items": "center" }}>
        <button ref={toggleRef} type="button" onClick={() => setOpen(!open())}>
          {open() ? "Close picker" : "Open picker"}
        </button>
        <span>
          Open: <output aria-label="Open state">{String(open())}</output>
        </span>
      </p>

      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Accent color</label>

        <div {...api().getControlProps()}>
          <button {...api().getTriggerProps()}>
            <div {...api().getTransparencyGridProps({ size: "10px" })} />
            <div {...api().getSwatchProps({ value: api().value })} />
          </button>
          <input {...api().getChannelInputProps({ channel: "hex" })} />
        </div>

        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div class="content__inner">
              <div {...api().getAreaProps()}>
                <div {...api().getAreaBackgroundProps()} />
                <div {...api().getAreaThumbProps()} />
              </div>

              <div {...api().getChannelSliderProps({ channel: "hue" })}>
                <div {...api().getChannelSliderTrackProps({ channel: "hue" })} />
                <div {...api().getChannelSliderThumbProps({ channel: "hue" })} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
