import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/segmented-control.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

const items = [
  { label: "Apple", value: "apple" },
  { label: "Orange", value: "orange" },
  { label: "Mango", value: "mango" },
]

function useSegmented(props: Partial<radio.Props> = {}) {
  const service = useMachine(radio.machine, {
    id: useId(),
    orientation: "horizontal",
    ...props,
  })
  return radio.connect(service, normalizeProps)
}

function Segmented(props: { api: radio.Api }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Indicator} {...api.getIndicatorProps()} />
      {items.map((item) => (
        <label
          key={item.value}
          className={styles.Item}
          {...api.getItemProps({ value: item.value })}
        >
          <span {...api.getItemTextProps({ value: item.value })}>
            {item.label}
          </span>
          <input {...api.getItemHiddenInputProps({ value: item.value })} />
        </label>
      ))}
    </div>
  )
}

export function SegmentedControlDefaultValue() {
  const api = useSegmented({ defaultValue: "apple" })
  return <Segmented api={api} />
}

export function SegmentedControlControlled() {
  const [value, setValue] = useState<string | null>("orange")
  const api = useSegmented({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Segmented api={api} />
      <Ghost onClick={() => setValue("mango")}>Pick mango from outside</Ghost>
    </Stack>
  )
}

export function SegmentedControlProgrammatic() {
  const api = useSegmented({ defaultValue: "apple" })
  return (
    <Stack>
      <Segmented api={api} />
      <Row>
        <Ghost onClick={() => api.setValue("orange")}>setValue("orange")</Ghost>
        <Ghost onClick={() => api.clearValue()}>clearValue()</Ghost>
      </Row>
    </Stack>
  )
}

export function SegmentedControlFocus() {
  const api = useSegmented({ defaultValue: "orange" })
  return (
    <Stack>
      <Segmented api={api} />
      <Ghost onClick={() => api.focus()}>focus()</Ghost>
    </Stack>
  )
}

export function SegmentedControlValueChange() {
  const [value, setValue] = useState<string | null>(null)
  const api = useSegmented({
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Segmented api={api} />
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function SegmentedControlVertical() {
  const api = useSegmented({ orientation: "vertical", defaultValue: "apple" })
  return <Segmented api={api} />
}
