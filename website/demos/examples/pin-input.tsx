import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/pin-input.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

function usePinInput(props: Partial<pinInput.Props> = {}) {
  const service = useMachine(pinInput.machine, {
    id: useId(),
    count: 4,
    ...props,
  })
  return pinInput.connect(service, normalizeProps)
}

function PinInput(props: { api: pinInput.Api }) {
  const { api } = props
  return (
    <div
      className={styles.Root}
      {...api.getRootProps()}
      style={{ marginBottom: 0 }}
    >
      {api.items.map((index) => (
        <input
          key={index}
          className={styles.Input}
          {...api.getInputProps({ index })}
        />
      ))}
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}

export function PinInputDefaultValue() {
  const api = usePinInput({ count: 3, defaultValue: ["1", "2", ""] })
  return <PinInput api={api} />
}

export function PinInputControlled() {
  const [value, setValue] = useState(["", "", "", ""])
  const api = usePinInput({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <PinInput api={api} />
      <Row>
        <Ghost onClick={() => setValue(["1", "9", "8", "4"])}>Fill 1984</Ghost>
        <Ghost onClick={() => setValue(["", "", "", ""])}>Clear</Ghost>
      </Row>
    </Stack>
  )
}

export function PinInputCount() {
  const api = usePinInput({ count: 6 })
  return <PinInput api={api} />
}

export function PinInputPlaceholder() {
  const api = usePinInput({ placeholder: "*" })
  return <PinInput api={api} />
}

export function PinInputBlurOnComplete() {
  const api = usePinInput({ blurOnComplete: true })
  return (
    <Stack>
      <PinInput api={api} />
      <Log label="focus leaves after" value="the last digit" />
    </Stack>
  )
}

export function PinInputAutoSubmit() {
  const [submitted, setSubmitted] = useState("—")
  const api = usePinInput({ autoSubmit: true, name: "code" })
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setSubmitted(show(data.get("code")))
      }}
    >
      <Stack>
        <PinInput api={api} />
        <Log label="submitted" value={submitted} />
      </Stack>
    </form>
  )
}

export function PinInputAlphanumeric() {
  const api = usePinInput({ type: "alphanumeric" })
  return (
    <Stack>
      <PinInput api={api} />
      <Log label="accepts" value="letters and digits" />
    </Stack>
  )
}

export function PinInputPattern() {
  const api = usePinInput({ pattern: "[0-9a-fA-F]" })
  return (
    <Stack>
      <PinInput api={api} />
      <Log label="accepts" value="hex characters" />
    </Stack>
  )
}

export function PinInputMask() {
  const api = usePinInput({ mask: true })
  return <PinInput api={api} />
}

export function PinInputValueChange() {
  const [value, setValue] = useState("—")
  const [complete, setComplete] = useState("—")
  const [invalid, setInvalid] = useState("—")
  const api = usePinInput({
    onValueChange: (details) => setValue(show(details.valueAsString)),
    onValueComplete: (details) => setComplete(details.valueAsString),
    onValueInvalid: (details) =>
      setInvalid(`"${details.value}" at ${details.index}`),
  })
  return (
    <Stack>
      <PinInput api={api} />
      <Log label="onValueChange" value={value} />
      <Log label="onValueComplete" value={complete} />
      <Log label="onValueInvalid" value={invalid} />
    </Stack>
  )
}

export function PinInputSanitize() {
  const [value, setValue] = useState("—")
  const api = usePinInput({
    count: 6,
    sanitizeValue: (value) => value.replace(/[-\s]/g, ""),
    onValueChange: (details) => setValue(show(details.valueAsString)),
  })
  return (
    <Stack>
      <PinInput api={api} />
      <Log label="try pasting" value="123-456" />
      <Log label="value" value={value} />
    </Stack>
  )
}

export function PinInputRtl() {
  const api = usePinInput({ dir: "rtl", defaultValue: ["1", "2", "", ""] })
  return <PinInput api={api} />
}
