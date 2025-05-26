import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { LuEye, LuEyeOff } from "react-icons/lu"
import { useId } from "react"

type PasswordInputProps = {
  controls: {
    ignorePasswordManagers: boolean
    disabled: boolean
  }
}

export function PasswordInput(props: PasswordInputProps) {
  const service = useMachine(passwordInput.machine, {
    id: useId(),
    ...props.controls,
  })

  const api = passwordInput.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Password</label>
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} />
        <button {...api.getVisibilityTriggerProps()}>
          <span {...api.getIndicatorProps()}>
            {api.visible ? <LuEye /> : <LuEyeOff />}
          </span>
        </button>
      </div>
    </div>
  )
}
