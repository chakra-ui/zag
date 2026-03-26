import * as colorPicker from "@zag-js/color-picker"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/color-picker.module.css"

interface ColorPickerProps extends Omit<colorPicker.Props, "id"> {}

export function ColorPicker(props: ColorPickerProps) {
  const service = useMachine(colorPicker.machine, {
    id: useId(),
    defaultValue: colorPicker.parse("#38a169").toFormat("hsla"),
    format: "hsla",
    ...props,
  })

  const api = colorPicker.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        <span>Color</span>: {api.value.toString("hex")}
      </label>

      <div className={styles.Control} {...api.getControlProps()}>
        <div className={styles.TriggerWrapper}>
          <button className={styles.Trigger} {...api.getTriggerProps()}>
            <div
              className={styles.TransparencyGrid}
              {...api.getTransparencyGridProps({ size: "10px" })}
            />
            <div
              className={styles.Swatch}
              {...api.getSwatchProps({ value: api.value })}
            />
          </button>
        </div>
        <input
          className={styles.ChannelInput}
          {...api.getChannelInputProps({ channel: "hex" })}
        />
        <input
          className={styles.ChannelInput}
          {...api.getChannelInputProps({ channel: "alpha" })}
        />
      </div>

      <Portal>
        <div {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            <div>
              <div className={styles.Area} {...api.getAreaProps()}>
                <div
                  className={styles.AreaBackground}
                  {...api.getAreaBackgroundProps()}
                />
                <div
                  className={styles.AreaThumb}
                  {...api.getAreaThumbProps()}
                />
              </div>

              <div className={styles.SliderGroup}>
                <div className={styles.Sliders}>
                  <div {...api.getChannelSliderProps({ channel: "hue" })}>
                    <div
                      className={styles.ChannelSliderTrack}
                      {...api.getChannelSliderTrackProps({ channel: "hue" })}
                    />
                    <div
                      className={styles.ChannelSliderThumb}
                      {...api.getChannelSliderThumbProps({ channel: "hue" })}
                    />
                  </div>

                  <div {...api.getChannelSliderProps({ channel: "alpha" })}>
                    <div
                      className={styles.TransparencyGrid}
                      {...api.getTransparencyGridProps({ size: "12px" })}
                    />
                    <div
                      className={styles.ChannelSliderTrack}
                      {...api.getChannelSliderTrackProps({ channel: "alpha" })}
                    />
                    <div
                      className={styles.ChannelSliderThumb}
                      {...api.getChannelSliderThumbProps({ channel: "alpha" })}
                    />
                  </div>
                </div>
                <button
                  className={styles.EyeDropperTrigger}
                  {...api.getEyeDropperTriggerProps()}
                >
                  <EyeDropIcon />
                </button>
              </div>

              <Show when={api.format.startsWith("hsl")}>
                <div className={styles.ChannelInputs}>
                  <div className={styles.ChannelInputWrapper}>
                    <input
                      className={styles.ChannelInput}
                      {...api.getChannelInputProps({ channel: "hue" })}
                    />
                    <span>H</span>
                  </div>
                  <div className={styles.ChannelInputWrapper}>
                    <input
                      className={styles.ChannelInput}
                      {...api.getChannelInputProps({ channel: "saturation" })}
                    />
                    <span>S</span>
                  </div>
                  <div className={styles.ChannelInputWrapper}>
                    <input
                      className={styles.ChannelInput}
                      {...api.getChannelInputProps({ channel: "lightness" })}
                    />
                    <span>L</span>
                  </div>
                  <div className={styles.ChannelInputWrapper}>
                    <input
                      className={styles.ChannelInput}
                      {...api.getChannelInputProps({ channel: "alpha" })}
                    />
                    <span>A</span>
                  </div>
                </div>
              </Show>

              <Show when={api.format.startsWith("rgb")}>
                <div className={styles.ChannelInputs}>
                  <div className={styles.ChannelInputWrapper}>
                    <input
                      className={styles.ChannelInput}
                      {...api.getChannelInputProps({ channel: "red" })}
                    />
                    <span>R</span>
                  </div>
                  <div className={styles.ChannelInputWrapper}>
                    <input
                      className={styles.ChannelInput}
                      {...api.getChannelInputProps({ channel: "green" })}
                    />
                    <span>G</span>
                  </div>
                  <div className={styles.ChannelInputWrapper}>
                    <input
                      className={styles.ChannelInput}
                      {...api.getChannelInputProps({ channel: "blue" })}
                    />
                    <span>B</span>
                  </div>
                  <div className={styles.ChannelInputWrapper}>
                    <input
                      className={styles.ChannelInput}
                      {...api.getChannelInputProps({ channel: "alpha" })}
                    />
                    <span>A</span>
                  </div>
                </div>
              </Show>

              <Show when={api.format.startsWith("hsb")}>
                <div className={styles.ChannelInputs}>
                  <div className={styles.ChannelInputWrapper}>
                    <input
                      className={styles.ChannelInput}
                      {...api.getChannelInputProps({ channel: "hue" })}
                    />
                    <span>H</span>
                  </div>
                  <div className={styles.ChannelInputWrapper}>
                    <input
                      className={styles.ChannelInput}
                      {...api.getChannelInputProps({ channel: "saturation" })}
                    />
                    <span>S</span>
                  </div>
                  <div className={styles.ChannelInputWrapper}>
                    <input
                      className={styles.ChannelInput}
                      {...api.getChannelInputProps({ channel: "brightness" })}
                    />
                    <span>B</span>
                  </div>
                  <div className={styles.ChannelInputWrapper}>
                    <input
                      className={styles.ChannelInput}
                      {...api.getChannelInputProps({ channel: "alpha" })}
                    />
                    <span>A</span>
                  </div>
                </div>
              </Show>

              <hr className={styles.Separator} />

              <div
                className={styles.SwatchGroup}
                {...api.getSwatchGroupProps()}
              >
                <p>Swatches</p>
                {presets.map((preset) => (
                  <button
                    className={styles.SwatchTrigger}
                    key={preset}
                    {...api.getSwatchTriggerProps({ value: preset })}
                  >
                    <div>
                      <div
                        className={styles.TransparencyGrid}
                        {...api.getTransparencyGridProps({ size: "4px" })}
                      />
                      <div
                        className={styles.Swatch}
                        {...api.getSwatchProps({ value: preset })}
                      />
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
