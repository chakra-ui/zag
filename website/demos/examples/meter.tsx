import * as meter from "@zag-js/meter"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/meter.module.css"
import { Button, Log, Row, Stack } from "./shared"

function useMeter(props: Partial<meter.Props> = {}) {
  const service = useMachine(meter.machine, { id: useId(), ...props })
  return meter.connect(service, normalizeProps)
}

function MeterView(props: { api: meter.Api; label?: string }) {
  const { api, label = "Storage used" } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Header}>
        <div className={styles.Label} {...api.getLabelProps()}>
          {label}
        </div>
        <div className={styles.ValueText} {...api.getValueTextProps()}>
          {api.valueAsString}
        </div>
      </div>
      <div className={styles.Track} {...api.getTrackProps()}>
        <div className={styles.Indicator} {...api.getIndicatorProps()} />
      </div>
    </div>
  )
}

export function MeterSetValue() {
  const api = useMeter({ defaultValue: 70 })
  return (
    <Stack>
      <MeterView api={api} />
      <Row>
        <Button onClick={() => api.setToMin()}>api.setToMin()</Button>
        <Button onClick={() => api.setValue(40)}>api.setValue(40)</Button>
        <Button onClick={() => api.setToMax()}>api.setToMax()</Button>
      </Row>
    </Stack>
  )
}

export function MeterValueChange() {
  const [value, setValue] = useState(50)
  const api = useMeter({
    defaultValue: 50,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <MeterView api={api} />
      <Row>
        <Button onClick={() => api.setValue(Math.max(api.value - 10, 0))}>
          −10
        </Button>
        <Button onClick={() => api.setValue(Math.min(api.value + 10, 100))}>
          +10
        </Button>
      </Row>
      <Log label="onValueChange" value={value} />
    </Stack>
  )
}

export function MeterMinMax() {
  const api = useMeter({ min: 0, max: 1000, defaultValue: 640 })
  return (
    <Stack>
      <MeterView api={api} label="Requests this hour" />
      <Log label="value" value={`${api.value} / ${api.max}`} />
    </Stack>
  )
}

export function MeterThresholds() {
  const api = useMeter({ defaultValue: 70, low: 60, high: 85, optimum: 10 })
  return (
    <Stack>
      <MeterView api={api} label="Disk usage" />
      <Row>
        {[30, 70, 95].map((value) => (
          <Button key={value} onClick={() => api.setValue(value)}>
            Set {value}
          </Button>
        ))}
      </Row>
      <Log label="data-state" value={api.valueState} />
    </Stack>
  )
}

export function MeterValueText() {
  const api = useMeter({
    defaultValue: 48,
    translations: {
      value: ({ value, max }) => `${value} of ${max} gigabytes used`,
    },
  })
  return <MeterView api={api} label="Cloud storage" />
}

export function MeterLocale() {
  const api = useMeter({
    defaultValue: 48,
    locale: "fr-FR",
    formatOptions: { style: "unit", unit: "gigabyte" },
  })
  return <MeterView api={api} label="Stockage" />
}

export function MeterVertical() {
  const api = useMeter({ orientation: "vertical", defaultValue: 70 })
  return <MeterView api={api} label="Battery" />
}
