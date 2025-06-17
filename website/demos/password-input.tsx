import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { LuEye, LuEyeOff } from "react-icons/lu"
import { useId } from "react"

interface PasswordInputProps extends Omit<passwordInput.Props, "id"> {}

export function PasswordInput(props: PasswordInputProps) {
  const service = useMachine(passwordInput.machine, {
    id: useId(),
    ...props,
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
