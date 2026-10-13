import * as colorPicker from "@zag-js/color-picker"
import { colorPickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import serialize from "form-serialize"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/color-picker.css"

const presets = ["#38a169", "oklab(0.72 -0.05 0.12)", "oklch(0.6 0.2 30)"]

export default function Page() {
  const controls = useControls(colorPickerControls)

  const service = useMachine(
    colorPicker.machine,
    controls.mergeProps<colorPicker.Props>({
      id: createUniqueId(),
      name: "color",
      format: "oklab",
      defaultValue: colorPicker.parse("oklab(0.7 -0.08 0.1)"),
    }),
  )

  const api = createMemo(() => colorPicker.connect(service, normalizeProps))
  const gamutOverlay = createMemo(() => api().getGamutOverlay())

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
              OKLab (wide gamut): <span data-testid="value-text">{api().valueAsString}</span>
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
                    <Show when={gamutOverlay()}>
                      {(overlay) => (
                        <svg {...api().getGamutOverlayProps()}>
                          <path
                            d={overlay().path}
                            fill="none"
                            stroke="rgba(255,255,255,0.7)"
                            stroke-width="1.5"
                            vector-effect="non-scaling-stroke"
                          />
                          <text
                            x={overlay().labelPosition.x}
                            y={overlay().labelPosition.y}
                            fill="rgba(255,255,255,0.7)"
                            font-size="6"
                            font-family="system-ui, sans-serif"
                            text-anchor="end"
                          >
                            sRGB
                          </text>
                        </svg>
                      )}
                    </Show>
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

                  <Show when={api().format === "oklab"}>
                    <div style={{ display: "flex", width: "100%", "flex-wrap": "wrap", gap: "6px" }}>
                      <span>L</span> <input {...api().getChannelInputProps({ channel: "lightness" })} />
                      <span>a</span> <input {...api().getChannelInputProps({ channel: "a" })} />
                      <span>b</span> <input {...api().getChannelInputProps({ channel: "b" })} />
                      <span>A</span> <input {...api().getChannelInputProps({ channel: "alpha" })} />
                    </div>
                  </Show>

                  <p data-testid="value-text">{api().valueAsString}</p>

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
