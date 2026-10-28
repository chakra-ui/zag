import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/checkbox.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

function useCheckbox(props: Partial<checkbox.Props> = {}) {
  const service = useMachine(checkbox.machine, { id: useId(), ...props })
  return checkbox.connect(service, normalizeProps)
}

function Checkbox(props: { api: checkbox.Api; label?: string }) {
  const { api } = props
  return (
    <label className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Control} {...api.getControlProps()}>
        {api.checkedState === true && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        )}
        {api.checkedState === "indeterminate" && (
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
            <line x1="6" x2="18" y1="12" y2="12" />
          </svg>
        )}
      </div>
      <span {...api.getLabelProps()}>{props.label ?? "Accept terms"}</span>
      <input {...api.getHiddenInputProps()} />
    </label>
  )
}

export function CheckboxDefaultChecked() {
  const api = useCheckbox({ defaultChecked: true })
  return <Checkbox api={api} />
}

export function CheckboxIndeterminate() {
  const api = useCheckbox({ defaultChecked: "indeterminate" })
  return <Checkbox api={api} label="Select all" />
}

export function CheckboxControlled() {
  const [checked, setChecked] = useState<checkbox.CheckedState>(false)
  const api = useCheckbox({
    checked,
    onCheckedChange: (details) => setChecked(details.checked),
  })
  return (
    <Stack>
      <Checkbox api={api} />
      <Row>
        <Ghost onClick={() => setChecked((c) => c !== true)}>
          Toggle from outside
        </Ghost>
        <Ghost onClick={() => setChecked("indeterminate")}>
          Set indeterminate
        </Ghost>
      </Row>
    </Stack>
  )
}

export function CheckboxDisabled() {
  const api = useCheckbox({ disabled: true })
  return <Checkbox api={api} />
}

export function CheckboxCheckedChange() {
  const [value, setValue] = useState<checkbox.CheckedState>(false)
  const api = useCheckbox({
    onCheckedChange: (details) => setValue(details.checked),
  })
  return (
    <Stack>
      <Checkbox api={api} />
      <Log label="checked" value={show(value)} />
    </Stack>
  )
}

export function CheckboxReadOnly() {
  const api = useCheckbox({ readOnly: true, defaultChecked: true })
  return <Checkbox api={api} label="Read-only" />
}
