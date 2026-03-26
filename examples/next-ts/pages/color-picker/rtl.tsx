import styles from "../../../../shared/src/css/color-picker.module.css"
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Show } from "../../components/show"

export default function Page() {
  const service = useMachine(colorPicker.machine, {
    id: useId(),
    defaultValue: colorPicker.parse("#3b82f6"),
    name: "color",
    format: "rgba",
    dir: "rtl",
  })

  const api = colorPicker.connect(service, normalizeProps)

  return (
    <main className="color-picker">
      <form {...api.getRootProps()} className={styles.Root}>
        <label {...api.getLabelProps()}>
          {"اختر اللون"} ({api.valueAsString})
        </label>
        <input {...api.getHiddenInputProps()} />

        <div {...api.getControlProps()} className={styles.Control}>
          <button {...api.getTriggerProps()}>
            <div {...api.getTransparencyGridProps({ size: "4px" })} className={styles.TransparencyGrid} />
            <div {...api.getSwatchProps({ value: api.value })} className={styles.Swatch} />
          </button>

          <input {...api.getChannelInputProps({ channel: "hex" })} className={styles.ChannelInput} />
          <input {...api.getChannelInputProps({ channel: "alpha" })} className={styles.ChannelInput} />
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()} className={styles.Content}>
            <div className="content__inner">
              <div {...api.getAreaProps()} className={styles.Area}>
                <div {...api.getAreaBackgroundProps()} className={styles.AreaBackground} />
                <div {...api.getAreaThumbProps()} className={styles.AreaThumb} />
              </div>

              <div {...api.getChannelSliderProps({ channel: "hue" })}>
                <div {...api.getChannelSliderTrackProps({ channel: "hue" })} className={styles.ChannelSliderTrack} />
                <div {...api.getChannelSliderThumbProps({ channel: "hue" })} className={styles.ChannelSliderThumb} />
              </div>

              <div {...api.getChannelSliderProps({ channel: "alpha" })}>
                <div {...api.getTransparencyGridProps({ size: "8px" })} className={styles.TransparencyGrid} />
                <div {...api.getChannelSliderTrackProps({ channel: "alpha" })} className={styles.ChannelSliderTrack} />
                <div {...api.getChannelSliderThumbProps({ channel: "alpha" })} className={styles.ChannelSliderThumb} />
              </div>

              <Show when={api.format.startsWith("hsl")}>
                <div style={{ display: "flex", width: "100%" }}>
                  <span>H</span> <input {...api.getChannelInputProps({ channel: "hue" })} className={styles.ChannelInput} />
                  <span>S</span> <input {...api.getChannelInputProps({ channel: "saturation" })} className={styles.ChannelInput} />
                  <span>L</span> <input {...api.getChannelInputProps({ channel: "lightness" })} className={styles.ChannelInput} />
                  <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} className={styles.ChannelInput} />
                </div>
              </Show>

              <Show when={api.format.startsWith("rgb")}>
                <div style={{ display: "flex", width: "100%" }}>
                  <span>R</span> <input {...api.getChannelInputProps({ channel: "red" })} className={styles.ChannelInput} />
                  <span>G</span> <input {...api.getChannelInputProps({ channel: "green" })} className={styles.ChannelInput} />
                  <span>B</span> <input {...api.getChannelInputProps({ channel: "blue" })} className={styles.ChannelInput} />
                  <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} className={styles.ChannelInput} />
                </div>
              </Show>

              <Show when={api.format.startsWith("hsb")}>
                <div style={{ display: "flex", width: "100%" }}>
                  <span>H</span> <input {...api.getChannelInputProps({ channel: "hue" })} className={styles.ChannelInput} />
                  <span>S</span> <input {...api.getChannelInputProps({ channel: "saturation" })} className={styles.ChannelInput} />
                  <span>B</span> <input {...api.getChannelInputProps({ channel: "brightness" })} className={styles.ChannelInput} />
                  <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} className={styles.ChannelInput} />
                </div>
              </Show>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
}
