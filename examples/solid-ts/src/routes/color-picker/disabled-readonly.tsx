import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/color-picker.css"

const errorId = "color-error"

function Picker(props: { label: string; api: colorPicker.Api }) {
  const invalid = () => props.api.getRootState().invalid
  return (
    <div {...props.api.getRootProps()}>
      <label {...props.api.getLabelProps()}>{props.label}</label>

      <div {...props.api.getControlProps()}>
        <button {...props.api.getTriggerProps()}>
          <div {...props.api.getTransparencyGridProps({ size: "10px" })} />
          <div {...props.api.getSwatchProps({ value: props.api.value })} />
        </button>
        <input
          {...props.api.getChannelInputProps({ channel: "hex" })}
          aria-describedby={invalid() ? errorId : undefined}
        />
      </div>

      <Show when={invalid()}>
        <p id={errorId} class="color-picker-error">
          Pick a color with enough contrast
        </p>
      </Show>

      <div {...props.api.getPositionerProps()}>
        <div {...props.api.getContentProps()}>
          <div class="content__inner">
            <div {...props.api.getAreaProps()}>
              <div {...props.api.getAreaBackgroundProps()} />
              <div {...props.api.getAreaThumbProps()} />
            </div>

            <div {...props.api.getChannelSliderProps({ channel: "hue" })}>
              <div {...props.api.getChannelSliderTrackProps({ channel: "hue" })} />
              <div {...props.api.getChannelSliderThumbProps({ channel: "hue" })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [invalid, setInvalid] = createSignal(true)

  const disabledService = useMachine(colorPicker.machine, {
    id: createUniqueId(),
    disabled: true,
    defaultValue: colorPicker.parse("#3b82f6"),
  })

  const readOnlyService = useMachine(colorPicker.machine, {
    id: createUniqueId(),
    readOnly: true,
    defaultValue: colorPicker.parse("#22c55e"),
  })

  const invalidId = createUniqueId()
  const invalidService = useMachine(colorPicker.machine, () => ({
    id: invalidId,
    invalid: invalid(),
    defaultValue: colorPicker.parse("#eab308"),
  }))

  const disabledApi = createMemo(() => colorPicker.connect(disabledService, normalizeProps))
  const readOnlyApi = createMemo(() => colorPicker.connect(readOnlyService, normalizeProps))
  const invalidApi = createMemo(() => colorPicker.connect(invalidService, normalizeProps))

  return (
    <main class="color-picker">
      <div class="color-picker-row">
        <Picker label="Disabled" api={disabledApi()} />
        <Picker label="Read-only" api={readOnlyApi()} />
        <Picker label="Invalid" api={invalidApi()} />
      </div>

      <label>
        <input type="checkbox" checked={invalid()} onChange={(event) => setInvalid(event.currentTarget.checked)} /> Mark
        as invalid
      </label>
    </main>
  )
}
