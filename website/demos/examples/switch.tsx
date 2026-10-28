import { normalizeProps, useMachine } from "@zag-js/react"
import * as zagSwitch from "@zag-js/switch"
import { useId, useState } from "react"
import styles from "../../styles/machines/switch.module.css"
import { Ghost, Log, Row, Stack } from "./shared"

function useSwitch(props: Partial<zagSwitch.Props> = {}) {
  const service = useMachine(zagSwitch.machine, { id: useId(), ...props })
  return zagSwitch.connect(service, normalizeProps)
}

function Switch(props: { api: zagSwitch.Api; label?: string }) {
  const { api } = props
  return (
    <label className={styles.Root} {...api.getRootProps()}>
      <input {...api.getHiddenInputProps()} />
      <span className={styles.Control} {...api.getControlProps()}>
        <span className={styles.Thumb} {...api.getThumbProps()} />
      </span>
      <span className={styles.Label} {...api.getLabelProps()}>
        {props.label ?? "Wi-Fi"}
      </span>
    </label>
  )
}

export function SwitchDefaultChecked() {
  const api = useSwitch({ defaultChecked: true })
  return <Switch api={api} />
}

export function SwitchControlled() {
  const [checked, setChecked] = useState(false)
  const api = useSwitch({
    checked,
    onCheckedChange: (details) => setChecked(details.checked),
  })
  return (
    <Stack>
      <Switch api={api} />
      <Ghost onClick={() => setChecked((c) => !c)}>Toggle from outside</Ghost>
    </Stack>
  )
}

export function SwitchCheckedChange() {
  const [checked, setChecked] = useState(false)
  const api = useSwitch({
    onCheckedChange: (details) => setChecked(details.checked),
  })
  return (
    <Stack>
      <Switch api={api} label="Notifications" />
      <Log label="switch is" value={checked ? "On" : "Off"} />
    </Stack>
  )
}

export function SwitchProgrammatic() {
  const api = useSwitch()
  return (
    <Stack>
      <Switch api={api} />
      <Row>
        <Ghost onClick={() => api.setChecked(true)}>setChecked(true)</Ghost>
        <Ghost onClick={() => api.toggleChecked()}>toggleChecked()</Ghost>
      </Row>
    </Stack>
  )
}
