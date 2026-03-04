import * as zagSwitch from "@zag-js/switch"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/switch.module.css"

interface SwitchProps extends Omit<zagSwitch.Props, "id"> {}

export function Switch(props: SwitchProps) {
  const service = useMachine(zagSwitch.machine, {
    id: useId(),
    ...props,
  })

  const api = zagSwitch.connect(service, normalizeProps)

  return (
    <label className={styles.Root} {...api.getRootProps()}>
      <input {...api.getHiddenInputProps()} />
      <span className={styles.Control} {...api.getControlProps()}>
        <span className={styles.Thumb} {...api.getThumbProps()} />
      </span>
      <span className={styles.Label} {...api.getLabelProps()}>
        {api.checked ? "On" : "Off"}
      </span>
    </label>
  )
}
