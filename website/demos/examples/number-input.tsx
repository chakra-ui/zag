import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { BiChevronDown, BiChevronUp } from "react-icons/bi"
import { RxDragHandleDots2 } from "react-icons/rx"
import styles from "../../styles/machines/number-input.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

function useNumberInput(props: Partial<numberInput.Props> = {}) {
  const service = useMachine(numberInput.machine, { id: useId(), ...props })
  return numberInput.connect(service, normalizeProps)
}

function NumberInput(props: {
  api: numberInput.Api
  label?: string
  scrubber?: boolean
}) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label {...api.getLabelProps()}>{props.label ?? "Quantity"}</label>
      <div className={styles.Control}>
        {props.scrubber && (
          <div className={styles.Scrubber} {...api.getScrubberProps()}>
            <RxDragHandleDots2 />
          </div>
        )}
        <input className={styles.Input} {...api.getInputProps()} />
        <div className={styles.Spinners}>
          <button
            className={styles.IncrementTrigger}
            {...api.getIncrementTriggerProps()}
          >
            <BiChevronUp />
          </button>
          <button
            className={styles.DecrementTrigger}
            {...api.getDecrementTriggerProps()}
          >
            <BiChevronDown />
          </button>
        </div>
      </div>
    </div>
  )
}

export function NumberInputDefaultValue() {
  const api = useNumberInput({ defaultValue: "13" })
  return <NumberInput api={api} />
}

export function NumberInputControlled() {
  const [value, setValue] = useState("")
  const api = useNumberInput({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <NumberInput api={api} />
      <Row>
        <Ghost onClick={() => setValue("42")}>Set to 42</Ghost>
        <Ghost onClick={() => setValue("")}>Clear</Ghost>
      </Row>
    </Stack>
  )
}

export function NumberInputMinMax() {
  const api = useNumberInput({
    min: 10,
    max: 200,
    defaultValue: "195",
    step: 5,
  })
  return <NumberInput api={api} label="Between 10 and 200" />
}

export function NumberInputValueInvalid() {
  const [reason, setReason] = useState("—")
  const api = useNumberInput({
    min: 0,
    max: 10,
    defaultValue: "9",
    allowOverflow: true,
    onValueInvalid: (details) => setReason(details.reason),
    onValueChange: (details) => {
      const n = details.valueAsNumber
      if (n >= 0 && n <= 10) setReason("—")
    },
  })
  return (
    <Stack>
      <NumberInput api={api} label="Between 0 and 10" />
      <Log label="onValueInvalid" value={reason} />
    </Stack>
  )
}

export function NumberInputScrubber() {
  const api = useNumberInput({ defaultValue: "20" })
  return (
    <Stack>
      <NumberInput api={api} scrubber />
      <Log label="try" value="Drag the handle left or right" />
    </Stack>
  )
}

export function NumberInputMouseWheel() {
  const api = useNumberInput({ allowMouseWheel: true, defaultValue: "5" })
  return (
    <Stack>
      <NumberInput api={api} />
      <Log label="try" value="Focus, then scroll over the input" />
    </Stack>
  )
}

export function NumberInputNoClamp() {
  const api = useNumberInput({
    clampValueOnBlur: false,
    max: 10,
    defaultValue: "8",
  })
  return (
    <Stack>
      <NumberInput api={api} label="Max 10" />
      <Log label="try" value="Type 25, then blur" />
    </Stack>
  )
}

export function NumberInputValueChange() {
  const [details, setDetails] = useState<numberInput.ValueChangeDetails>()
  const api = useNumberInput({ defaultValue: "1", onValueChange: setDetails })
  return (
    <Stack>
      <NumberInput api={api} />
      <Log
        label="onValueChange"
        value={details ? `${show(details.value)} via ${details.reason}` : "—"}
      />
    </Stack>
  )
}

export function NumberInputValueCommit() {
  const [details, setDetails] = useState<numberInput.ValueChangeDetails>()
  const api = useNumberInput({ defaultValue: "1", onValueCommit: setDetails })
  return (
    <Stack>
      <NumberInput api={api} />
      <Log
        label="committed"
        value={details ? `${show(details.value)} via ${details.reason}` : "—"}
      />
    </Stack>
  )
}

export function NumberInputFocusChange() {
  const [focused, setFocused] = useState(false)
  const api = useNumberInput({
    onFocusChange: (details) => setFocused(details.focused),
  })
  return (
    <Stack>
      <NumberInput api={api} />
      <Log label="focused" value={String(focused)} />
    </Stack>
  )
}

export function NumberInputPrecision() {
  const api = useNumberInput({
    defaultValue: "1.5",
    step: 0.25,
    formatOptions: { maximumFractionDigits: 4, minimumFractionDigits: 2 },
  })
  return <NumberInput api={api} label="Weight (kg)" />
}

export function NumberInputNoSpin() {
  const api = useNumberInput({ spinOnPress: false, defaultValue: "0" })
  return (
    <Stack>
      <NumberInput api={api} />
      <Log label="try" value="Hold a stepper: it moves one step" />
    </Stack>
  )
}

export function NumberInputCurrency() {
  const api = useNumberInput({
    defaultValue: "1250",
    step: 50,
    formatOptions: { style: "currency", currency: "USD" },
  })
  return <NumberInput api={api} label="Price" />
}
