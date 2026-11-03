import { DateFormatter, getLocalTimeZone, today } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/date-input.module.css"
import { Button, Ghost, Log, Row, show, Stack } from "./shared"

function useDateInput(props: Partial<dateInput.Props> = {}) {
  const service = useMachine(dateInput.machine, {
    id: useId(),
    locale: "en-US",
    ...props,
  })
  return dateInput.connect(service, normalizeProps)
}

function Segments(props: { api: dateInput.Api; index?: number }) {
  const { api, index } = props
  return (
    <div
      className={styles.SegmentGroup}
      {...api.getSegmentGroupProps({ index })}
    >
      {api.getSegments({ index }).map((segment, i) => (
        <span
          key={i}
          className={styles.Segment}
          {...api.getSegmentProps({ segment, index })}
        >
          {/* Node and the browser disagree on narrow spaces in literals */}
          {segment.type === "literal"
            ? segment.text.replace(/\s/g, " ")
            : segment.text}
        </span>
      ))}
    </div>
  )
}

function Field(props: { api: dateInput.Api; label?: string }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        {props.label ?? "Select a date"}
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <Segments api={api} />
      </div>
    </div>
  )
}

export function DateInputSegments() {
  const api = useDateInput()
  return <Field api={api} />
}

export function DateInputInitialValue() {
  const api = useDateInput({
    defaultValue: [dateInput.parse("2024-01-15")],
  })
  return <Field api={api} />
}

export function DateInputControlled() {
  const [value, setValue] = useState<dateInput.DateValue[]>([
    dateInput.parse("2024-01-15"),
  ])
  const api = useDateInput({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Field api={api} />
      <Row>
        <Ghost onClick={() => setValue([today(getLocalTimeZone())])}>
          Today
        </Ghost>
        <Ghost onClick={() => setValue([dateInput.parse("2024-01-15")])}>
          Jan 15, 2024
        </Ghost>
      </Row>
      <Log label="value" value={show(value.map((date) => date.toString()))} />
    </Stack>
  )
}

export function DateInputMinMax() {
  const api = useDateInput({
    min: dateInput.parse("2024-01-01"),
    max: dateInput.parse("2024-12-31"),
    defaultValue: [dateInput.parse("2024-06-15")],
  })
  return (
    <Stack>
      <Field api={api} label="A date in 2024" />
      <Log label="invalid" value={String(api.invalid)} />
    </Stack>
  )
}

export function DateInputDisabled() {
  const api = useDateInput({
    disabled: true,
    defaultValue: [dateInput.parse("2024-01-15")],
  })
  return <Field api={api} />
}

export function DateInputReadOnly() {
  const api = useDateInput({
    readOnly: true,
    defaultValue: [dateInput.parse("2024-01-15")],
  })
  return <Field api={api} />
}

export function DateInputInvalid() {
  const [value, setValue] = useState<dateInput.DateValue[]>([])
  const api = useDateInput({
    required: true,
    invalid: value.length === 0,
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Field api={api} label="Required date" />
      <Log label="invalid" value={String(api.invalid)} />
    </Stack>
  )
}

export function DateInputGranularity() {
  const api = useDateInput({ granularity: "minute" })
  return <Field api={api} label="Date and time" />
}

export function DateInputLeadingZeros() {
  const api = useDateInput({
    shouldForceLeadingZeros: true,
    defaultValue: [dateInput.parse("2024-01-05")],
  })
  return <Field api={api} />
}

export function DateInputPlaceholder() {
  const [placeholder, setPlaceholder] = useState("2024-01-01")
  const api = useDateInput({
    defaultPlaceholderValue: dateInput.parse("2024-01-01"),
    onPlaceholderChange: (details) =>
      setPlaceholder(details.placeholderValue.toString()),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="placeholderValue" value={placeholder} />
    </Stack>
  )
}

export function DateInputFocusChange() {
  const [focused, setFocused] = useState(false)
  const api = useDateInput({
    onFocusChange: (details) => setFocused(details.focused),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="focused" value={String(focused)} />
    </Stack>
  )
}

export function DateInputRange() {
  const api = useDateInput({ selectionMode: "range" })
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Trip dates
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <Segments api={api} index={0} />
        <span className={styles.RangeSeparator}>–</span>
        <Segments api={api} index={1} />
      </div>
    </div>
  )
}

export function DateInputClear() {
  const api = useDateInput({
    defaultValue: [dateInput.parse("2024-01-15")],
  })
  return (
    <Stack>
      <Field api={api} />
      <Ghost onClick={api.clearValue}>Clear</Ghost>
    </Stack>
  )
}

export function DateInputLocale() {
  const api = useDateInput({
    locale: "en-GB",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    defaultValue: [dateInput.parse("2024-01-15")],
  })
  return <Field api={api} />
}

export function DateInputHourCycle() {
  const api = useDateInput({ granularity: "hour", hourCycle: 24 })
  return <Field api={api} label="Date and hour" />
}

const formatter = new DateFormatter("en-US", {
  dateStyle: "short",
  timeStyle: "short",
})

export function DateInputFormatter() {
  const api = useDateInput({ formatter })
  return <Field api={api} label="Date and time" />
}

export function DateInputForm() {
  const [submitted, setSubmitted] = useState("—")
  const api = useDateInput({ name: "birthDate" })
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        setSubmitted(show(formData.get("birthDate")))
      }}
    >
      <Stack>
        <Field api={api} label="Birth date" />
        <input {...api.getHiddenInputProps({ name: "birthDate" })} />
        <Button type="submit">Submit</Button>
        <Log label="birthDate" value={submitted} />
      </Stack>
    </form>
  )
}

export function DateInputValueChange() {
  const [value, setValue] = useState<string[]>([])
  const api = useDateInput({
    onValueChange: (details) => setValue(details.valueAsString),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="valueAsString" value={show(value)} />
    </Stack>
  )
}

export function DateInputTranslations() {
  const api = useDateInput({
    translations: {
      placeholder: () => ({
        year: "YYYY",
        month: "MM",
        day: "DD",
        hour: "HH",
        minute: "MM",
        second: "SS",
        dayPeriod: "AM",
        era: "AD",
      }),
    },
  })
  return <Field api={api} />
}
