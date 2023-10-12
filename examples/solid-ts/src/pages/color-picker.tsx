import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { colorPickerControls } from "@zag-js/shared"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import serialize from "form-serialize"

const presets = ["#f47373", "#697689"]

const EyeDropIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m4 15.76-1 4A1 1 0 0 0 3.75 21a1 1 0 0 0 .49 0l4-1a1 1 0 0 0 .47-.26L17 11.41l1.29 1.3 1.42-1.42-1.3-1.29L21 7.41a2 2 0 0 0 0-2.82L19.41 3a2 2 0 0 0-2.82 0L14 5.59l-1.3-1.3-1.42 1.42L12.58 7l-8.29 8.29a1 1 0 0 0-.29.47zm1.87.75L14 8.42 15.58 10l-8.09 8.1-2.12.53z"></path>
  </svg>
)

export default function Page() {
  const controls = useControls(colorPickerControls)

  const [state, send] = useMachine(
    colorPicker.machine({
      id: createUniqueId(),
      name: "color",
      value: colorPicker.parse("hsl(0, 100%, 50%)"),
    }),
    {
      context: controls.context,
    },
  )

  const api = createMemo(() => colorPicker.connect(state, send, normalizeProps))

  return (
    <>
      <main class="color-picker">
        <form
          onChange={(e) => {
            console.log("change:", serialize(e.currentTarget, { hash: true }))
          }}
        >
          <input {...api().hiddenInputProps} />
          <div {...api().rootProps}>
            <label {...api().labelProps}>
              Select Color: <span data-testid="value-text">{api().valueAsString}</span>
            </label>

            <div {...api().controlProps}>
              <button {...api().triggerProps}>
                <div {...api().getTransparencyGridProps({ size: "10px" })} />
                <div {...api().getSwatchProps({ value: api().value })} />
              </button>
              <input {...api().getChannelInputProps({ channel: "hex" })} />
              <input {...api().getChannelInputProps({ channel: "alpha" })} />
            </div>

            <div {...api().positionerProps}>
              <div {...api().contentProps}>
                <div class="content__inner">
                  <div {...api().getAreaProps()}>
                    <div {...api().getAreaBackgroundProps()} />
                    <div {...api().getAreaThumbProps()} />
                  </div>

                  <div {...api().getChannelSliderProps({ channel: "hue" })}>
                    <div {...api().getChannelSliderTrackProps({ channel: "hue" })} />
                    <div {...api().getChannelSliderThumbProps({ channel: "hue" })} />
                  </div>

                  <div {...api().getChannelSliderProps({ channel: "alpha" })}>
                    <div {...api().getTransparencyGridProps({ size: "12px" })} />
                    <div {...api().getChannelSliderTrackProps({ channel: "alpha" })} />
                    <div {...api().getChannelSliderThumbProps({ channel: "alpha" })} />
                  </div>

                  <div style={{ display: "flex", width: "100%" }}>
                    <input {...api().getChannelInputProps({ channel: "hue" })} />
                    <input {...api().getChannelInputProps({ channel: "saturation" })} />
                    <input {...api().getChannelInputProps({ channel: "lightness" })} />
                    <input {...api().getChannelInputProps({ channel: "alpha" })} />
                  </div>

                  <div style={{ display: "flex", gap: "10px", "align-items": "center" }}>
                    <div style={{ position: "relative" }}>
                      <div {...api().getTransparencyGridProps({ size: "4px" })} />
                      <div {...api().getSwatchProps({ value: api().value })} />
                    </div>
                    <p data-testid="value-text">{api().valueAsString}</p>
                  </div>

                  <input {...api().getChannelInputProps({ channel: "hex" })} />

                  <div {...api().swatchGroupProps} style={{ display: "flex", gap: "10px" }}>
                    <Index each={presets}>
                      {(preset) => (
                        <button {...api().getSwatchTriggerProps({ value: preset() })}>
                          <div style={{ position: "relative" }}>
                            <div {...api().getTransparencyGridProps({ size: "4px" })} />
                            <div {...api().getSwatchProps({ value: preset() })} />
                          </div>
                        </button>
                      )}
                    </Index>
                  </div>

                  <button {...api().eyeDropperTriggerProps}>
                    <EyeDropIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </form>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
