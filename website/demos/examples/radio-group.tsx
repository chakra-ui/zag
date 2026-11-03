import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/radio.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

const items = [
  { value: "apple", label: "Apples" },
  { value: "orange", label: "Oranges" },
  { value: "mango", label: "Mangoes" },
]

function useRadio(props: Partial<radio.Props> = {}) {
  const service = useMachine(radio.machine, { id: useId(), ...props })
  return radio.connect(service, normalizeProps)
}

function RadioGroup(props: { api: radio.Api }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <span className={styles.Label} {...api.getLabelProps()}>
        Fruits
      </span>
      <div className={styles.ItemsGroup}>
        {items.map((item) => (
          <label
            key={item.value}
            className={styles.Item}
            {...api.getItemProps({ value: item.value })}
          >
            <span
              className={styles.ItemText}
              {...api.getItemTextProps({ value: item.value })}
            >
              {item.label}
            </span>
            <input {...api.getItemHiddenInputProps({ value: item.value })} />
            <div
              className={styles.ItemControl}
              {...api.getItemControlProps({ value: item.value })}
            />
          </label>
        ))}
      </div>
    </div>
  )
}

export function RadioGroupDisabled() {
  const api = useRadio({ disabled: true, defaultValue: "orange" })
  return <RadioGroup api={api} />
}

export function RadioGroupDefaultValue() {
  const api = useRadio({ defaultValue: "apple" })
  return <RadioGroup api={api} />
}

export function RadioGroupControlled() {
  const [value, setValue] = useState<string | null>("orange")
  const api = useRadio({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <RadioGroup api={api} />
      <Row>
        <Ghost onClick={() => setValue("mango")}>Pick mangoes</Ghost>
        <Ghost onClick={() => setValue(null)}>Clear</Ghost>
      </Row>
    </Stack>
  )
}

export function RadioGroupValueChange() {
  const [value, setValue] = useState<string | null>(null)
  const api = useRadio({
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <RadioGroup api={api} />
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function RadioGroupVertical() {
  const api = useRadio({ orientation: "vertical", defaultValue: "apple" })
  return <RadioGroup api={api} />
}

export function RadioGroupReadOnly() {
  const api = useRadio({
    readOnly: true,
    required: true,
    defaultValue: "mango",
  })
  return <RadioGroup api={api} />
}

export function RadioGroupInvalid() {
  const api = useRadio({ invalid: true })
  return <RadioGroup api={api} />
}
