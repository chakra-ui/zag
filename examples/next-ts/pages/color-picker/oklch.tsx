import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { colorPickerControls } from "@zag-js/shared"
import serialize from "form-serialize"
import { useId } from "react"
import { Show } from "../../components/show"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const presets = ["#f47373", "oklch(0.7 0.2 200)", "#9f7aea"]

export default function Page() {
  const controls = useControls(colorPickerControls)

  const service = useMachine(colorPicker.machine, {
    id: useId(),
    name: "color",
    ...controls.context,
    format: "oklch",
    defaultValue: colorPicker.parse("oklch(0.65 0.15 250)"),
  })

  const api = colorPicker.connect(service, normalizeProps)
  const gamutOverlay = api.getGamutOverlay()

  return (
    <>
      <main className="color-picker">
        <form
          onChange={(e) => {
            console.log("change:", serialize(e.currentTarget, { hash: true }))
          }}
        >
          <input {...api.getHiddenInputProps()} />
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>
              OKLCH (wide gamut): <span data-testid="value-text">{api.valueAsString}</span>
            </label>

            <div {...api.getControlProps()}>
              <button {...api.getTriggerProps()}>
                <div {...api.getTransparencyGridProps({ size: "10px" })} />
                <div {...api.getSwatchProps({ value: api.value })} />
              </button>
              <input {...api.getChannelInputProps({ channel: "hex" })} />
              <input {...api.getChannelInputProps({ channel: "alpha" })} />
            </div>

            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
                <div className="content__inner">
                  <div {...api.getAreaProps()}>
                    <div {...api.getAreaBackgroundProps()} />
                    {gamutOverlay ? (
                      <svg {...api.getGamutOverlayProps()}>
                        <path
                          d={gamutOverlay.path}
                          fill="none"
                          stroke="rgba(255,255,255,0.7)"
                          strokeWidth="1.5"
                          vectorEffect="non-scaling-stroke"
                        />
                        <text
                          x={gamutOverlay.labelPosition.x}
                          y={gamutOverlay.labelPosition.y}
                          fill="rgba(255,255,255,0.7)"
                          fontSize="6"
                          fontFamily="system-ui, sans-serif"
                          textAnchor="end"
                        >
                          sRGB
                        </text>
                      </svg>
                    ) : null}
                    <div {...api.getAreaThumbProps()} />
                  </div>

                  <div {...api.getChannelSliderProps({ channel: "hue" })}>
                    <div {...api.getChannelSliderTrackProps({ channel: "hue" })} />
                    <div {...api.getChannelSliderThumbProps({ channel: "hue" })} />
                  </div>

                  <div {...api.getChannelSliderProps({ channel: "alpha" })}>
                    <div {...api.getTransparencyGridProps({ size: "12px" })} />
                    <div {...api.getChannelSliderTrackProps({ channel: "alpha" })} />
                    <div {...api.getChannelSliderThumbProps({ channel: "alpha" })} />
                  </div>

                  <Show when={api.format === "oklch"}>
                    <div style={{ display: "flex", width: "100%", flexWrap: "wrap", gap: "6px" }}>
                      <span>L</span> <input {...api.getChannelInputProps({ channel: "lightness" })} />
                      <span>C</span> <input {...api.getChannelInputProps({ channel: "chroma" })} />
                      <span>H</span> <input {...api.getChannelInputProps({ channel: "hue" })} />
                      <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} />
                    </div>
                  </Show>

                  <p data-testid="value-text">{api.valueAsString}</p>

                  <div {...api.getSwatchGroupProps()} style={{ display: "flex", gap: "10px" }}>
                    {presets.map((preset) => (
                      <button key={preset} {...api.getSwatchTriggerProps({ value: preset })}>
                        <div style={{ position: "relative" }}>
                          <div {...api.getTransparencyGridProps({ size: "4px" })} />
                          <div {...api.getSwatchProps({ value: preset })} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </form>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
