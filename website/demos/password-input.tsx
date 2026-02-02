import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { LuEye, LuEyeOff } from "react-icons/lu"
import { useId } from "react"
import styles from "../styles/machines/password-input.module.css"

interface PasswordInputProps extends Omit<passwordInput.Props, "id"> {}

export function PasswordInput(props: PasswordInputProps) {
  const service = useMachine(passwordInput.machine, {
    id: useId(),
    ...props,
  })

  const api = passwordInput.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Password
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <input className={styles.Input} {...api.getInputProps()} />
        <button
          className={styles.VisibilityTrigger}
          {...api.getVisibilityTriggerProps()}
        >
          <span {...api.getIndicatorProps()}>
            {api.visible ? <LuEye /> : <LuEyeOff />}
          </span>
        </button>
      </div>
    </div>
  )
}
