import * as colorPicker from "@zag-js/color-picker"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const presets = ["#f47373", "#697689", "#38a169", "#3182ce"]

const Show = (props: { when: boolean; children: React.ReactNode }) => {
  const { when, children } = props
  return when ? <>{children}</> : null
}

const EyeDropIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m4 15.76-1 4A1 1 0 0 0 3.75 21a1 1 0 0 0 .49 0l4-1a1 1 0 0 0 .47-.26L17 11.41l1.29 1.3 1.42-1.42-1.3-1.29L21 7.41a2 2 0 0 0 0-2.82L19.41 3a2 2 0 0 0-2.82 0L14 5.59l-1.3-1.3-1.42 1.42L12.58 7l-8.29 8.29a1 1 0 0 0-.29.47zm1.87.75L14 8.42 15.58 10l-8.09 8.1-2.12.53z"></path>
  </svg>
)

export function ColorPicker(props: Omit<colorPicker.Props, "id">) {
  const service = useMachine(colorPicker.machine, {
    id: useId(),
    defaultValue: colorPicker.parse("#38a169").toFormat("hsla"),
    ...props,
  })

  const api = colorPicker.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>
        <span>Color</span>: {api.value.toString("hex")}
      </label>

      <div {...api.getControlProps()}>
        <div>
          <button {...api.getTriggerProps()}>
            <div {...api.getTransparencyGridProps({ size: "10px" })} />
            <div {...api.getSwatchProps({ value: api.value })} />
          </button>
        </div>
        <input {...api.getChannelInputProps({ channel: "hex" })} />
        <input {...api.getChannelInputProps({ channel: "alpha" })} />
      </div>

      <Portal>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div>
              <div {...api.getAreaProps()}>
                <div {...api.getAreaBackgroundProps()} />
                <div {...api.getAreaThumbProps()} />
              </div>

              <div>
                <div>
                  <div {...api.getChannelSliderProps({ channel: "hue" })}>
                    <div
                      {...api.getChannelSliderTrackProps({ channel: "hue" })}
                    />
                    <div
                      {...api.getChannelSliderThumbProps({ channel: "hue" })}
                    />
                  </div>

                  <div {...api.getChannelSliderProps({ channel: "alpha" })}>
                    <div {...api.getTransparencyGridProps({ size: "12px" })} />
                    <div
                      {...api.getChannelSliderTrackProps({ channel: "alpha" })}
                    />
                    <div
                      {...api.getChannelSliderThumbProps({ channel: "alpha" })}
                    />
                  </div>
                </div>
                <button {...api.getEyeDropperTriggerProps()}>
                  <EyeDropIcon />
                </button>
              </div>

              <Show when={api.format.startsWith("hsl")}>
                <div>
                  <div>
                    <input {...api.getChannelInputProps({ channel: "hue" })} />
                    <span>H</span>
                  </div>
                  <div>
                    <input
                      {...api.getChannelInputProps({ channel: "saturation" })}
                    />
                    <span>S</span>
                  </div>
                  <div>
                    <input
                      {...api.getChannelInputProps({ channel: "lightness" })}
                    />
                    <span>L</span>
                  </div>
                  <div>
                    <input
                      {...api.getChannelInputProps({ channel: "alpha" })}
                    />
                    <span>A</span>
                  </div>
                </div>
              </Show>

              <Show when={api.format.startsWith("rgb")}>
                <div>
                  <div>
                    <input {...api.getChannelInputProps({ channel: "red" })} />
                    <span>R</span>
                  </div>
                  <div>
                    <input
                      {...api.getChannelInputProps({ channel: "green" })}
                    />
                    <span>G</span>
                  </div>
                  <div>
                    <input {...api.getChannelInputProps({ channel: "blue" })} />
                    <span>B</span>
                  </div>
                  <div>
                    <input
                      {...api.getChannelInputProps({ channel: "alpha" })}
                    />
                    <span>A</span>
                  </div>
                </div>
              </Show>

              <Show when={api.format.startsWith("hsb")}>
                <div>
                  <div>
                    <input {...api.getChannelInputProps({ channel: "hue" })} />
                    <span>H</span>
                  </div>
                  <div>
                    <input
                      {...api.getChannelInputProps({ channel: "saturation" })}
                    />
                    <span>S</span>
                  </div>
                  <div>
                    <input
                      {...api.getChannelInputProps({ channel: "brightness" })}
                    />
                    <span>B</span>
                  </div>
                  <div>
                    <input
                      {...api.getChannelInputProps({ channel: "alpha" })}
                    />
                    <span>A</span>
                  </div>
                </div>
              </Show>

              <hr />

              <div {...api.getSwatchGroupProps()}>
                <p>Swatches</p>
                {presets.map((preset) => (
                  <button
                    key={preset}
                    {...api.getSwatchTriggerProps({ value: preset })}
                  >
                    <div>
                      <div {...api.getTransparencyGridProps({ size: "4px" })} />
                      <div {...api.getSwatchProps({ value: preset })} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </div>
  )
}
