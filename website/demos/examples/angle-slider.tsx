import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/angle-slider.module.css"
import { Button, Log, Row, Stack, show } from "./shared"

const marks = [0, 45, 90, 135, 180, 225, 270, 315]

function useAngleSlider(props: Partial<angleSlider.Props> = {}) {
  const service = useMachine(angleSlider.machine, { id: useId(), ...props })
  return angleSlider.connect(service, normalizeProps)
}

function AngleSliderView(props: {
  api: angleSlider.Api
  marks?: number[]
  valueText?: string
}) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Wind direction
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <div className={styles.Thumb} {...api.getThumbProps()} />
        <div className={styles.MarkerGroup} {...api.getMarkerGroupProps()}>
          {(props.marks ?? marks).map((value) => (
            <div
              key={value}
              className={styles.Marker}
              {...api.getMarkerProps({ value })}
            />
          ))}
        </div>
      </div>
      <div className={styles.ValueText} {...api.getValueTextProps()}>
        {props.valueText ?? api.valueAsDegree}
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}

export function AngleSliderInitialValue() {
  const api = useAngleSlider({ defaultValue: 45 })
  return <AngleSliderView api={api} />
}

export function AngleSliderControlled() {
  const [value, setValue] = useState(90)
  const api = useAngleSlider({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <AngleSliderView api={api} />
      <Row>
        <Button onClick={() => setValue(0)}>North</Button>
        <Button onClick={() => setValue(90)}>East</Button>
        <Button onClick={() => setValue(180)}>South</Button>
      </Row>
    </Stack>
  )
}

export function AngleSliderStep() {
  const api = useAngleSlider({ step: 0.01, defaultValue: 120.25 })
  return <AngleSliderView api={api} valueText={`${api.value.toFixed(2)}°`} />
}

export function AngleSliderValueChange() {
  const [changing, setChanging] = useState<string>()
  const [changed, setChanged] = useState<number>()
  const api = useAngleSlider({
    onValueChange: (details) => setChanging(details.valueAsDegree),
    onValueChangeEnd: (details) => setChanged(details.value),
  })
  return (
    <Stack>
      <AngleSliderView api={api} />
      <Log label="valueAsDegree" value={show(changing)} />
      <Log label="onValueChangeEnd" value={show(changed)} />
    </Stack>
  )
}

export function AngleSliderReadOnly() {
  const api = useAngleSlider({ readOnly: true, defaultValue: 135 })
  return <AngleSliderView api={api} />
}

export function AngleSliderMarks() {
  const api = useAngleSlider({ defaultValue: 60 })
  return (
    <AngleSliderView
      api={api}
      marks={Array.from({ length: 24 }, (_, i) => i * 15)}
    />
  )
}
