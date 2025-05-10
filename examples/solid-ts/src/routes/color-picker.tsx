import * as colorPicker from "@zag-js/color-picker"
import { colorPickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import serialize from "form-serialize"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

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

  const service = useMachine(
    colorPicker.machine,
    controls.mergeProps<colorPicker.Props>({
      id: createUniqueId(),
      name: "color",
      defaultValue: colorPicker.parse("hsl(0, 100%, 50%)"),
    }),
  )

  const api = createMemo(() => colorPicker.connect(service, normalizeProps))
  const format = createMemo(() => api().format)
  return (
    <>
      <main class="color-picker">
        <form
          onChange={(e) => {
            console.log("change:", serialize(e.currentTarget, { hash: true }))
          }}
        >
          <input {...api().getHiddenInputProps()} />
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>
              Select Color: <span data-testid="value-text">{api().valueAsString}</span>
            </label>

            <div {...api().getControlProps()}>
              <button {...api().getTriggerProps()}>
                <div {...api().getTransparencyGridProps({ size: "10px" })} />
                <div {...api().getSwatchProps({ value: api().value })} />
              </button>
              <input {...api().getChannelInputProps({ channel: "hex" })} />
              <input {...api().getChannelInputProps({ channel: "alpha" })} />
            </div>

            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()}>
                <div class="content__inner">
                  <div {...api().getAreaProps()}>
                    <div {...api().getAreaBackgroundProps()} />
                    <div {...api().getAreaThumbProps()} />
                  </div>
                  <Show when={format().startsWith("rgb")}>
                    <div {...api().getChannelSliderProps({ channel: "red" })}>
                      <div {...api().getChannelSliderTrackProps({ channel: "red" })} />
                      <div {...api().getChannelSliderThumbProps({ channel: "red" })} />
                    </div>
                    <div {...api().getChannelSliderProps({ channel: "green" })}>
                      <div {...api().getChannelSliderTrackProps({ channel: "green" })} />
                      <div {...api().getChannelSliderThumbProps({ channel: "green" })} />
                    </div>
                    <div {...api().getChannelSliderProps({ channel: "blue" })}>
                      <div {...api().getChannelSliderTrackProps({ channel: "blue" })} />
                      <div {...api().getChannelSliderThumbProps({ channel: "blue" })} />
                    </div>
                  </Show>
                  <Show when={format().startsWith("okl")}>
                    <div {...api().getChannelSliderProps({ channel: "lightness" })}>
                      <div {...api().getChannelSliderTrackProps({ channel: "lightness" })} />
                      <div {...api().getChannelSliderThumbProps({ channel: "lightness" })} />
                    </div>
                  </Show>
                  <Show when={format() === "oklab"}>
                    <div {...api().getChannelSliderProps({ channel: "a" })}>
                      <div {...api().getChannelSliderTrackProps({ channel: "a" })} />
                      <div {...api().getChannelSliderThumbProps({ channel: "a" })} />
                    </div>
                    <div {...api().getChannelSliderProps({ channel: "b" })}>
                      <div {...api().getChannelSliderTrackProps({ channel: "b" })} />
                      <div {...api().getChannelSliderThumbProps({ channel: "b" })} />
                    </div>
                  </Show>
                  <Show when={format() === "oklch"}>
                    <div {...api().getChannelSliderProps({ channel: "chroma" })}>
                      <div {...api().getChannelSliderTrackProps({ channel: "chroma" })} />
                      <div {...api().getChannelSliderThumbProps({ channel: "chroma" })} />
                    </div>
                  </Show>
                  <Show when={format() !== "rgba" && format() !== "oklab"}>
                    <div {...api().getChannelSliderProps({ channel: "hue" })}>
                      <div {...api().getChannelSliderTrackProps({ channel: "hue" })} />
                      <div {...api().getChannelSliderThumbProps({ channel: "hue" })} />
                    </div>
                  </Show>
                  <Show when={format().includes("s")}>
                    <div {...api().getChannelSliderProps({ channel: "saturation" })}>
                      <div {...api().getChannelSliderTrackProps({ channel: "saturation" })} />
                      <div {...api().getChannelSliderThumbProps({ channel: "saturation" })} />
                    </div>
                  </Show>
                  <Show when={format().startsWith("hsl")}>
                    <div {...api().getChannelSliderProps({ channel: "lightness" })}>
                      <div {...api().getChannelSliderTrackProps({ channel: "lightness" })} />
                      <div {...api().getChannelSliderThumbProps({ channel: "lightness" })} />
                    </div>
                  </Show>
                  <Show when={format().startsWith("hsb")}>
                    <div {...api().getChannelSliderProps({ channel: "brightness" })}>
                      <div {...api().getChannelSliderTrackProps({ channel: "brightness" })} />
                      <div {...api().getChannelSliderThumbProps({ channel: "brightness" })} />
                    </div>
                  </Show>
                  <div {...api().getChannelSliderProps({ channel: "alpha" })}>
                    <div {...api().getChannelSliderTrackProps({ channel: "alpha" })} />
                    <div {...api().getChannelSliderThumbProps({ channel: "alpha" })} />
                  </div>

                  <Show when={api().format.startsWith("hsl")}>
                    <div style={{ display: "flex", width: "100%" }}>
                      <span>H</span> <input {...api().getChannelInputProps({ channel: "hue" })} />
                      <span>S</span> <input {...api().getChannelInputProps({ channel: "saturation" })} />
                      <span>L</span> <input {...api().getChannelInputProps({ channel: "lightness" })} />
                      <span>A</span> <input {...api().getChannelInputProps({ channel: "alpha" })} />
                    </div>
                  </Show>

                  <Show when={api().format.startsWith("rgb")}>
                    <div style={{ display: "flex", width: "100%" }}>
                      <span>R</span> <input {...api().getChannelInputProps({ channel: "red" })} />
                      <span>G</span> <input {...api().getChannelInputProps({ channel: "green" })} />
                      <span>B</span> <input {...api().getChannelInputProps({ channel: "blue" })} />
                      <span>A</span> <input {...api().getChannelInputProps({ channel: "alpha" })} />
                    </div>
                  </Show>

                  <Show when={api().format.startsWith("hsb")}>
                    <div style={{ display: "flex", width: "100%" }}>
                      <span>H</span> <input {...api().getChannelInputProps({ channel: "hue" })} />
                      <span>S</span> <input {...api().getChannelInputProps({ channel: "saturation" })} />
                      <span>B</span> <input {...api().getChannelInputProps({ channel: "brightness" })} />
                      <span>A</span> <input {...api().getChannelInputProps({ channel: "alpha" })} />
                    </div>
                  </Show>
                  <Show when={format() === "oklab"}>
                    <div style={{ display: "flex", width: "100%" }}>
                      <span>L</span> <input {...api().getChannelInputProps({ channel: "lightness" })} />
                      <span>A</span> <input {...api().getChannelInputProps({ channel: "a" })} />
                      <span>B</span> <input {...api().getChannelInputProps({ channel: "b" })} />
                      <span>Alpha</span> <input {...api().getChannelInputProps({ channel: "alpha" })} />
                    </div>
                  </Show>
                  <Show when={format() === "oklch"}>
                    <div style={{ display: "flex", width: "100%" }}>
                      <span>L</span> <input {...api().getChannelInputProps({ channel: "lightness" })} />
                      <span>C</span> <input {...api().getChannelInputProps({ channel: "chroma" })} />
                      <span>H</span> <input {...api().getChannelInputProps({ channel: "hue" })} />
                      <span>Alpha</span> <input {...api().getChannelInputProps({ channel: "alpha" })} />
                    </div>
                  </Show>

                  <div style={{ display: "flex", gap: "10px", "align-items": "center" }}>
                    <div style={{ position: "relative" }}>
                      <div {...api().getTransparencyGridProps({ size: "4px" })} />
                      <div {...api().getSwatchProps({ value: api().value })} />
                    </div>
                    <p data-testid="value-text">{api().valueAsString}</p>
                  </div>

                  <input {...api().getChannelInputProps({ channel: "hex" })} />

                  <div {...api().getSwatchGroupProps()} style={{ display: "flex", gap: "10px" }}>
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

                  <button {...api().getEyeDropperTriggerProps()}>
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

      <Toolbar viz controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
