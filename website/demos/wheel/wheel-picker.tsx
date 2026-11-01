import { useId, useState } from "react"
import styles from "../../styles/machines/wheel.module.css"
import { useWheel } from "./use-wheel"
import * as wheel from "./wheel"

type WheelPickerProps = Omit<
  wheel.WheelProps,
  "id" | "value" | "onValueChange"
> & {
  value: string
  onValueChange: (value: string) => void
  showLabel?: boolean
}

export function WheelPicker(props: WheelPickerProps) {
  const { showLabel = true, ...rest } = props
  const wheelProps = { id: useId(), ...rest }
  const api = useWheel(wheelProps)

  return (
    <div {...api.getRootProps()} className={styles.Root}>
      {showLabel && (
        <span {...api.getLabelProps()} className={styles.Label}>
          {props.label}
        </span>
      )}
      <div data-wheel-frame="" className={styles.Frame}>
        <div {...api.getViewportProps()} className={styles.Viewport}>
          <div {...api.getItemGroupProps()}>
            {wheel.getRows(wheelProps).map(({ row, item }) => (
              <div key={row} {...api.getItemProps(row)} className={styles.Item}>
                {item.label}
              </div>
            ))}
          </div>
        </div>
        <div {...api.getHighlightProps()} className={styles.Highlight} />
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}

const frameworks: wheel.WheelItem[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "angular", label: "Angular", disabled: true },
  { value: "preact", label: "Preact" },
  { value: "lit", label: "Lit" },
]

export function FrameworkWheel() {
  const [value, setValue] = useState("svelte")
  return (
    <div className={styles.Demo}>
      <WheelPicker
        label="Framework"
        name="framework"
        items={frameworks}
        value={value}
        onValueChange={setValue}
      />
      <output data-testid="framework-value">Selected: {value}</output>
    </div>
  )
}

const pad = (n: number) => String(n).padStart(2, "0")

/** 12- or 24-hour columns, from the locale */
function getHourCycle(locale: string) {
  return (
    new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions()
      .hourCycle ?? "h23"
  )
}

/** The locale's names for AM and PM */
function getDayPeriods(locale: string) {
  const format = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    hourCycle: "h12",
  })
  return [9, 21].map((hour) => {
    const parts = format.formatToParts(new Date(2020, 0, 1, hour))
    return (
      parts.find((part) => part.type === "dayPeriod")?.value ??
      (hour < 12 ? "AM" : "PM")
    )
  })
}

export function TimeWheel(props: { locale?: string }) {
  const { locale = "en-US" } = props
  const twelveHour = getHourCycle(locale).startsWith("h1")
  const [am, pm] = getDayPeriods(locale)

  const hours = twelveHour
    ? Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: pad(i + 1),
      }))
    : Array.from({ length: 24 }, (_, i) => ({
        value: String(i),
        label: pad(i),
      }))
  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: String(i),
    label: pad(i),
  }))
  const periods = [
    { value: "am", label: am },
    { value: "pm", label: pm },
  ]

  const [hour, setHour] = useState(twelveHour ? "9" : "21")
  const [minute, setMinute] = useState("41")
  const [period, setPeriod] = useState("pm")

  return (
    <div className={styles.Demo}>
      <fieldset aria-label="Time" className={styles.Group}>
        <WheelPicker
          showLabel={false}
          label="Hour"
          items={hours}
          value={hour}
          onValueChange={setHour}
          loop
        />
        <WheelPicker
          showLabel={false}
          label="Minute"
          items={minutes}
          value={minute}
          onValueChange={setMinute}
          loop
        />
        {twelveHour && (
          <WheelPicker
            showLabel={false}
            label="AM/PM"
            items={periods}
            value={period}
            onValueChange={setPeriod}
          />
        )}
      </fieldset>
      <output data-testid="time-value">
        {pad(+hour)}:{pad(+minute)}
        {twelveHour && ` ${period === "am" ? am : pm}`}
      </output>
    </div>
  )
}
