import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/rating-group.module.css"
import { Button, Ghost, Log, Row, Stack } from "./shared"

function useRating(props: Partial<rating.Props> = {}) {
  const service = useMachine(rating.machine, { id: useId(), ...props })
  return rating.connect(service, normalizeProps)
}

function RatingView(props: { api: rating.Api }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Rate your stay
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        {api.items.map((index) => {
          const state = api.getItemState({ index })
          return (
            <span
              key={index}
              className={styles.Item}
              {...api.getItemProps({ index })}
            >
              {state.half ? <HalfStar /> : <Star />}
            </span>
          )
        })}
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}

export function RatingInitialValue() {
  const api = useRating({ defaultValue: 2.5, allowHalf: true })
  return <RatingView api={api} />
}

export function RatingControlled() {
  const [value, setValue] = useState(3)
  const api = useRating({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <RatingView api={api} />
      <Row>
        <Button onClick={() => setValue(1)}>Set 1</Button>
        <Button onClick={() => setValue(5)}>Set 5</Button>
      </Row>
      <Log label="value" value={value} />
    </Stack>
  )
}

export function RatingSetValue() {
  const api = useRating({ defaultValue: 2 })
  return (
    <Stack>
      <RatingView api={api} />
      <Row>
        <Button onClick={() => api.setValue(4)}>api.setValue(4)</Button>
        <Ghost onClick={() => api.clearValue()}>api.clearValue()</Ghost>
      </Row>
    </Stack>
  )
}

export function RatingHalf() {
  const [value, setValue] = useState(3.5)
  const api = useRating({
    allowHalf: true,
    defaultValue: 3.5,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <RatingView api={api} />
      <Log label="value" value={value} />
    </Stack>
  )
}

export function RatingValueChange() {
  const [value, setValue] = useState<number>()
  const api = useRating({
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <RatingView api={api} />
      <Log label="onValueChange" value={value ?? "—"} />
    </Stack>
  )
}

export function RatingHoverChange() {
  const [hovered, setHovered] = useState(-1)
  const api = useRating({
    defaultValue: 2,
    onHoverChange: (details) => setHovered(details.hoveredValue),
  })
  return (
    <Stack>
      <RatingView api={api} />
      <Log label="hoveredValue" value={hovered} />
    </Stack>
  )
}

function HalfStar() {
  return (
    <svg viewBox="0 0 273 260" className={styles.Star}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M135.977 214.086L52.1294 259.594L69.6031 165.229L0 99.1561L95.1465 86.614L135.977 1.04785V214.086Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M135.977 213.039L219.826 258.546L202.352 164.181L271.957 98.1082L176.808 85.5661L135.977 0V213.039Z"
        className={styles.StarEmpty}
      />
    </svg>
  )
}

function Star() {
  return (
    <svg viewBox="0 0 273 260" className={styles.Star}>
      <path
        d="M136.5 0L177.83 86.614L272.977 99.1561L203.374 165.229L220.847 259.594L136.5 213.815L52.1528 259.594L69.6265 165.229L0.0233917 99.1561L95.1699 86.614L136.5 0Z"
        fill="currentColor"
      />
    </svg>
  )
}
