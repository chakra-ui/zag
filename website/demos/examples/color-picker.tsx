import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/color-picker.module.css"
import { Button, Ghost, Log, Row, Stack } from "./shared"

const presets = ["#f47373", "#697689", "#38a169", "#3182ce", "#d69e2e"]

const channelsByFormat: Record<string, colorPicker.ColorChannel[]> = {
  rgba: ["red", "green", "blue", "alpha"],
  hsla: ["hue", "saturation", "lightness", "alpha"],
  hsba: ["hue", "saturation", "brightness", "alpha"],
}

function useColorPicker(props: Partial<colorPicker.Props> = {}) {
  const service = useMachine(colorPicker.machine, {
    id: useId(),
    defaultValue: colorPicker.parse("#38a169"),
    ...props,
  })
  return colorPicker.connect(service, normalizeProps)
}

interface PickerProps {
  api: colorPicker.Api
  swatches?: boolean
  channels?: boolean
  eyeDropper?: boolean
}

function Picker(props: PickerProps) {
  const { api } = props
  const content = (
    <div className={styles.Content} {...api.getContentProps()}>
      <div>
        <div className={styles.Area} {...api.getAreaProps()}>
          <div
            className={styles.AreaBackground}
            {...api.getAreaBackgroundProps()}
          />
          <div className={styles.AreaThumb} {...api.getAreaThumbProps()} />
        </div>

        <div className={styles.SliderGroup}>
          <div className={styles.Sliders}>
            <div
              className={styles.ChannelSlider}
              {...api.getChannelSliderProps({ channel: "hue" })}
            >
              <div
                className={styles.ChannelSliderTrack}
                {...api.getChannelSliderTrackProps({ channel: "hue" })}
              />
              <div
                className={styles.ChannelSliderThumb}
                {...api.getChannelSliderThumbProps({ channel: "hue" })}
              />
            </div>
            <div
              className={styles.ChannelSlider}
              {...api.getChannelSliderProps({ channel: "alpha" })}
            >
              <div
                className={styles.TransparencyGrid}
                {...api.getTransparencyGridProps({ size: "8px" })}
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
          {props.eyeDropper && (
            <button
              className={styles.EyeDropperTrigger}
              {...api.getEyeDropperTriggerProps()}
            >
              <EyeDropIcon />
            </button>
          )}
        </div>

        {props.channels && channelsByFormat[api.format] && (
          <div className={styles.ChannelInputs}>
            {channelsByFormat[api.format].map((channel) => (
              <div key={channel} className={styles.ChannelInputWrapper}>
                <input
                  className={styles.ChannelInput}
                  {...api.getChannelInputProps({ channel })}
                />
                <span>{channel.charAt(0).toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}

        {props.swatches && (
          <>
            <hr className={styles.Separator} />
            <div className={styles.SwatchGroup} {...api.getSwatchGroupProps()}>
              {presets.map((preset) => (
                <button
                  key={preset}
                  className={styles.SwatchTrigger}
                  {...api.getSwatchTriggerProps({ value: preset })}
                >
                  <div
                    className={styles.Swatch}
                    {...api.getSwatchProps({ value: preset })}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Accent color
      </label>
      {api.inline ? (
        content
      ) : (
        <>
          <div className={styles.Control} {...api.getControlProps()}>
            <button className={styles.Trigger} {...api.getTriggerProps()}>
              <div
                className={styles.TransparencyGrid}
                {...api.getTransparencyGridProps({ size: "6px" })}
              />
              <div
                className={styles.Swatch}
                {...api.getSwatchProps({ value: api.value })}
              />
            </button>
            <input
              className={styles.ChannelInput}
              {...api.getChannelInputProps({ channel: "hex" })}
            />
          </div>
          <Portal>
            <div {...api.getPositionerProps()}>{content}</div>
          </Portal>
        </>
      )}
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}

export function ColorPickerInitialValue() {
  const api = useColorPicker({ defaultValue: colorPicker.parse("#ff0000") })
  return <Picker api={api} />
}

export function ColorPickerControlled() {
  const [color, setColor] = useState(() => colorPicker.parse("#3182ce"))
  const api = useColorPicker({
    value: color,
    onValueChange: (details) => setColor(details.value),
  })
  return (
    <Stack>
      <Picker api={api} />
      <Row>
        {presets.slice(0, 3).map((preset) => (
          <Button
            key={preset}
            onClick={() => setColor(colorPicker.parse(preset))}
          >
            {preset}
          </Button>
        ))}
      </Row>
      <Log label="value" value={color.toString("hex")} />
    </Stack>
  )
}

export function ColorPickerValueChange() {
  const [changing, setChanging] = useState("—")
  const [changed, setChanged] = useState("—")
  const api = useColorPicker({
    onValueChange: (details) => setChanging(details.valueAsString),
    onValueChangeEnd: (details) => setChanged(details.valueAsString),
  })
  return (
    <Stack>
      <Picker api={api} />
      <Log label="onValueChange" value={changing} />
      <Log label="onValueChangeEnd" value={changed} />
    </Stack>
  )
}

export function ColorPickerFormat() {
  const [value, setValue] = useState("—")
  const api = useColorPicker({
    format: "hsla",
    onValueChange: (details) => setValue(details.valueAsString),
  })
  return (
    <Stack>
      <Picker api={api} channels />
      <Log label="valueAsString" value={value} />
    </Stack>
  )
}

export function ColorPickerDefaultFormat() {
  const api = useColorPicker({ defaultFormat: "hsla" })
  return (
    <Stack>
      <Picker api={api} channels />
      <Log label="format" value={api.format} />
    </Stack>
  )
}

const formats = ["rgba", "hsla", "hsba"] as const

export function ColorPickerControlledFormat() {
  const [format, setFormat] = useState<colorPicker.ColorFormat>("rgba")
  const api = useColorPicker({
    format,
    onFormatChange: (details) => setFormat(details.format),
  })
  return (
    <Stack>
      <Picker api={api} channels />
      <Row>
        {formats.map((value) => (
          <Ghost
            key={value}
            aria-pressed={format === value}
            onClick={() => setFormat(value)}
          >
            {value}
          </Ghost>
        ))}
      </Row>
      <Log label="format" value={format} />
    </Stack>
  )
}

export function ColorPickerSwatches() {
  const api = useColorPicker()
  return <Picker api={api} swatches />
}

export function ColorPickerCloseOnSelect() {
  const api = useColorPicker({ closeOnSelect: true })
  return <Picker api={api} swatches />
}

export function ColorPickerDisabled() {
  const api = useColorPicker({ disabled: true })
  return <Picker api={api} />
}

export function ColorPickerOpenControlled() {
  const [open, setOpen] = useState(false)
  const api = useColorPicker({
    open,
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <Picker api={api} />
      <Row>
        <Ghost onClick={() => setOpen((current) => !current)}>
          {open ? "Close" : "Open"} from outside
        </Ghost>
      </Row>
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function ColorPickerPositioning() {
  const api = useColorPicker({
    positioning: { placement: "bottom-start", gutter: 8 },
  })
  return <Picker api={api} />
}

export function ColorPickerInline() {
  const api = useColorPicker({ inline: true })
  return (
    <Stack>
      <Picker api={api} />
      <Log label="value" value={api.value.toString("hex")} />
    </Stack>
  )
}

export function ColorPickerChannelInputs() {
  const api = useColorPicker({
    defaultValue: colorPicker.parse("hsl(0, 100%, 50%)"),
  })
  return <Picker api={api} channels />
}

export function ColorPickerPreview() {
  const api = useColorPicker({
    defaultValue: colorPicker.parse("rgba(49, 130, 206, 0.5)"),
  })
  return (
    <Stack>
      <Row>
        <div className={styles.Preview}>
          <div
            className={styles.TransparencyGrid}
            {...api.getTransparencyGridProps({ size: "8px" })}
          />
          <div
            className={styles.Swatch}
            {...api.getSwatchProps({ value: api.value })}
          />
        </div>
        <div className={styles.Preview}>
          <div
            className={styles.Swatch}
            {...api.getSwatchProps({ value: api.value, respectAlpha: false })}
          />
        </div>
      </Row>
      <Picker api={api} />
    </Stack>
  )
}

export function ColorPickerEyeDropper() {
  const api = useColorPicker()
  return <Picker api={api} eyeDropper />
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
