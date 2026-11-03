import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { LuEye, LuEyeOff } from "react-icons/lu"
import styles from "../../styles/machines/password-input.module.css"
import { Ghost, Log, Stack } from "./shared"

function usePasswordInput(props: Partial<passwordInput.Props> = {}) {
  const service = useMachine(passwordInput.machine, { id: useId(), ...props })
  return passwordInput.connect(service, normalizeProps)
}

function PasswordInput(props: { api: passwordInput.Api; value?: string }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Password
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <input
          className={styles.Input}
          defaultValue={props.value ?? "correct-horse"}
          {...api.getInputProps()}
        />
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

export function PasswordInputDefaultVisible() {
  const api = usePasswordInput({ defaultVisible: true })
  return <PasswordInput api={api} />
}

export function PasswordInputControlled() {
  const [visible, setVisible] = useState(true)
  const api = usePasswordInput({
    visible,
    onVisibilityChange: (details) => setVisible(details.visible),
  })
  return (
    <Stack>
      <PasswordInput api={api} />
      <Ghost onClick={() => setVisible((v) => !v)}>
        {visible ? "Hide" : "Show"} from outside
      </Ghost>
      <Log label="visible" value={String(visible)} />
    </Stack>
  )
}

export function PasswordInputReadOnly() {
  const api = usePasswordInput({ readOnly: true })
  return <PasswordInput api={api} />
}
