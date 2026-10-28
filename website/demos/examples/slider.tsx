import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/slider.module.css"
import { Button, Ghost, Log, Row, Stack, show } from "./shared"

function useSlider(props: Partial<slider.Props> = {}) {
  const service = useMachine(slider.machine, {
    id: useId(),
    thumbSize: { width: 20, height: 20 },
    ...props,
  })
  return slider.connect(service, normalizeProps)
}

interface SliderViewProps {
  api: slider.Api
  label?: string
  marks?: number[]
}

function SliderView(props: SliderViewProps) {
  const { api, label = "Volume", marks } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Header}>
        <label className={styles.Label} {...api.getLabelProps()}>
          {label}
        </label>
        <output className={styles.ValueText} {...api.getValueTextProps()}>
          {api.value.join(" – ")}
        </output>
      </div>
      <div className={styles.Control} {...api.getControlProps()}>
        <div className={styles.Track} {...api.getTrackProps()}>
          <div className={styles.Range} {...api.getRangeProps()} />
        </div>
        {api.value.map((_, index) => (
          <div
            key={index}
            className={styles.Thumb}
            {...api.getThumbProps({ index })}
          >
            <input {...api.getHiddenInputProps({ index })} />
          </div>
        ))}
      </div>
      {marks && (
        <div className={styles.MarkerGroup} {...api.getMarkerGroupProps()}>
          {marks.map((value) => (
            <span
              key={value}
              className={styles.Marker}
              {...api.getMarkerProps({ value })}
            >
              {value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function SliderVertical() {
  const api = useSlider({ orientation: "vertical", defaultValue: [40] })
  return <SliderView api={api} />
}

export function SliderInitialValue() {
  const api = useSlider({ defaultValue: [30] })
  return <SliderView api={api} />
}

export function SliderControlled() {
  const [value, setValue] = useState([40])
  const api = useSlider({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <SliderView api={api} />
      <Row>
        <Button onClick={() => setValue([0])}>Mute</Button>
        <Button onClick={() => setValue([50])}>Half</Button>
        <Button onClick={() => setValue([100])}>Max</Button>
      </Row>
    </Stack>
  )
}

export function SliderMinMax() {
  const api = useSlider({ min: -10, max: 10, defaultValue: [0] })
  return <SliderView api={api} label="Offset" marks={[-10, 0, 10]} />
}

export function SliderStep() {
  const api = useSlider({ min: 5, max: 10, step: 0.01, defaultValue: [7.5] })
  return <SliderView api={api} label="Weight" />
}

export function SliderValueChange() {
  const [changing, setChanging] = useState<number[]>()
  const [changed, setChanged] = useState<number[]>()
  const api = useSlider({
    defaultValue: [50],
    onValueChange: (details) => setChanging(details.value),
    onValueChangeEnd: (details) => setChanged(details.value),
  })
  return (
    <Stack>
      <SliderView api={api} />
      <Log label="onValueChange" value={show(changing)} />
      <Log label="onValueChangeEnd" value={show(changed)} />
    </Stack>
  )
}

export function SliderFocusChange() {
  const [focused, setFocused] = useState(-1)
  const api = useSlider({
    defaultValue: [25, 75],
    onFocusChange: (details) => setFocused(details.focusedIndex),
  })
  return (
    <Stack>
      <SliderView api={api} label="Range" />
      <Log label="focusedIndex" value={focused} />
    </Stack>
  )
}

export function SliderOrigin() {
  const center = useSlider({
    origin: "center",
    min: -50,
    max: 50,
    defaultValue: [20],
  })
  const end = useSlider({ origin: "end", defaultValue: [60] })
  const zero = useSlider({ min: -3, max: 1, step: 0.1, origin: 0 })
  return (
    <Stack>
      <SliderView api={center} label="origin: center" />
      <SliderView api={end} label="origin: end" />
      <SliderView api={zero} label="origin: 0" />
    </Stack>
  )
}

export function SliderThumbAlignment() {
  const center = useSlider({ thumbAlignment: "center", defaultValue: [0] })
  const contain = useSlider({ thumbAlignment: "contain", defaultValue: [0] })
  return (
    <Stack>
      <SliderView api={center} label="center" />
      <SliderView api={contain} label="contain" />
    </Stack>
  )
}

const collisions = ["none", "push", "swap"] as const

export function SliderThumbCollision() {
  const [behavior, setBehavior] = useState<(typeof collisions)[number]>("swap")
  const api = useSlider({
    defaultValue: [20, 80],
    thumbCollisionBehavior: behavior,
  })
  return (
    <Stack>
      <SliderView api={api} label="Range" />
      <Row>
        {collisions.map((value) => (
          <Ghost
            key={value}
            aria-pressed={behavior === value}
            onClick={() => setBehavior(value)}
          >
            {value}
          </Ghost>
        ))}
      </Row>
      <Log label="thumbCollisionBehavior" value={behavior} />
    </Stack>
  )
}

export function SliderRtl() {
  const api = useSlider({ dir: "rtl", defaultValue: [30] })
  return (
    <div dir="rtl">
      <SliderView api={api} label="مستوى الصوت" />
    </div>
  )
}

export function SliderMarks() {
  const api = useSlider({ defaultValue: [30] })
  return <SliderView api={api} marks={[10, 30, 90]} />
}

export function SliderRangeInitial() {
  const api = useSlider({ defaultValue: [30, 60] })
  return <SliderView api={api} label="Range" />
}

export function SliderRangeControlled() {
  const [value, setValue] = useState([20, 60])
  const api = useSlider({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <SliderView api={api} label="Range" />
      <Row>
        <Button onClick={() => setValue([0, 100])}>Full range</Button>
        <Button onClick={() => setValue([40, 60])}>Middle</Button>
      </Row>
    </Stack>
  )
}

export function SliderRangeMinSteps() {
  const api = useSlider({
    defaultValue: [40, 60],
    step: 10,
    minStepsBetweenThumbs: 1,
  })
  return <SliderView api={api} label="Range" marks={[0, 50, 100]} />
}
