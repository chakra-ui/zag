import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/progress.module.css"
import { Button, Ghost, Log, Row, Stack, show } from "./shared"

function useProgress(props: Partial<progress.Props> = {}) {
  const service = useMachine(progress.machine, { id: useId(), ...props })
  return progress.connect(service, normalizeProps)
}

function Linear(props: { api: progress.Api; label?: string }) {
  const { api, label = "Upload progress" } = props
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
        <div className={styles.Range} {...api.getRangeProps()} />
      </div>
    </div>
  )
}

function Circular(props: {
  api: progress.Api
  size?: string
  thickness?: string
}) {
  const { api, size, thickness } = props
  const circle = api.getCircleProps() as any
  const vars: Record<string, string> = {}
  if (size) vars["--size"] = size
  if (thickness) vars["--thickness"] = thickness
  return (
    <div className={`${styles.Root} ${styles.Centre}`} {...api.getRootProps()}>
      <svg
        className={styles.Circle}
        {...circle}
        style={{ ...circle.style, ...vars }}
      >
        <circle
          className={styles.CircleTrack}
          {...(api.getCircleTrackProps() as any)}
        />
        <circle
          className={styles.CircleRange}
          {...(api.getCircleRangeProps() as any)}
        />
      </svg>
      <div className={styles.ValueText} {...api.getValueTextProps()}>
        {api.valueAsString}
      </div>
    </div>
  )
}

function Steps(props: { api: progress.Api; step?: number }) {
  const { api, step = 10 } = props
  return (
    <Row>
      <Button onClick={() => api.setValue((api.value ?? 0) - step)}>
        −{step}
      </Button>
      <Button onClick={() => api.setValue((api.value ?? 0) + step)}>
        +{step}
      </Button>
    </Row>
  )
}

export function ProgressSetValue() {
  const api = useProgress({ defaultValue: 50 })
  return (
    <Stack>
      <Linear api={api} />
      <Row>
        <Button onClick={() => api.setValue(25)}>api.setValue(25)</Button>
        <Button onClick={() => api.setValue(50)}>api.setValue(50)</Button>
        <Button onClick={() => api.setValue(100)}>api.setValue(100)</Button>
      </Row>
    </Stack>
  )
}

export function ProgressValueChange() {
  const [value, setValue] = useState<number | null>(40)
  const api = useProgress({
    defaultValue: 40,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Linear api={api} />
      <Steps api={api} />
      <Log label="onValueChange" value={show(value)} />
    </Stack>
  )
}

export function ProgressMinMax() {
  const api = useProgress({ min: 0, max: 1000, defaultValue: 250 })
  return (
    <Stack>
      <Linear api={api} label="Files synced" />
      <Steps api={api} step={250} />
      <Log label="value" value={`${api.value} / ${api.max}`} />
    </Stack>
  )
}

export function ProgressIndeterminate() {
  const api = useProgress({ defaultValue: null })
  return (
    <Stack>
      <Linear api={api} label="Reconnecting" />
      <Row>
        <Ghost onClick={() => api.setValue(api.indeterminate ? 60 : null)}>
          {api.indeterminate ? "Set to 60" : "Set to null"}
        </Ghost>
      </Row>
    </Stack>
  )
}

export function ProgressValueText() {
  const api = useProgress({
    defaultValue: 30,
    translations: {
      value: ({ value, max }) =>
        value == null ? "Loading..." : `${value} of ${max} items loaded`,
    },
  })
  return (
    <Stack>
      <Linear api={api} label="Import" />
      <Row>
        <Steps api={api} />
        <Ghost onClick={() => api.setValue(null)}>Indeterminate</Ghost>
      </Row>
    </Stack>
  )
}

export function ProgressLocale() {
  const api = useProgress({
    defaultValue: 42.5,
    locale: "fr-FR",
    formatOptions: { style: "percent", maximumFractionDigits: 1 },
  })
  return (
    <Stack>
      <Linear api={api} label="Téléversement" />
      <Steps api={api} step={12.5} />
    </Stack>
  )
}

export function ProgressLinearUsage() {
  const api = useProgress({ defaultValue: 60 })
  return (
    <Stack>
      <Linear api={api} />
      <Steps api={api} step={20} />
    </Stack>
  )
}

export function ProgressVertical() {
  const api = useProgress({ orientation: "vertical", defaultValue: 70 })
  return (
    <Stack>
      <Linear api={api} label="Level" />
      <Steps api={api} step={20} />
    </Stack>
  )
}

function Ring(props: { size?: string; thickness?: string }) {
  const api = useProgress({ defaultValue: 65 })
  return <Circular api={api} {...props} />
}

export function ProgressCircleSize() {
  return (
    <Row>
      <Ring size="48px" thickness="6px" />
      <Ring size="80px" thickness="8px" />
      <Ring size="120px" />
    </Row>
  )
}

export function ProgressCircleThickness() {
  return (
    <Row>
      <Ring thickness="4px" />
      <Ring thickness="12px" />
      <Ring thickness="24px" />
    </Row>
  )
}
