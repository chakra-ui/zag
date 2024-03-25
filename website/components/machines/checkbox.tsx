import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

type CheckboxProps = {
  controls: {
    disabled: boolean
    indeterminate: boolean
  }
}

export function Checkbox(props: CheckboxProps) {
  const { disabled, indeterminate } = props.controls
  const [state, send] = useMachine(checkbox.machine({ id: useId() }), {
    context: Object.assign(
      { disabled },
      { checked: (indeterminate ? "indeterminate" : false) as any },
    ),
  })

  const api = checkbox.connect(state, send, normalizeProps)

  return (
    <div>
      <label {...api.rootProps}>
        <span {...api.labelProps}>Checkbox Input</span>
        <input data-peer {...api.hiddenInputProps} />
        <div {...api.controlProps}>
          {api.checkedState === true && (
            <svg viewBox="0 0 24 24" fill="currentcolor" transform="scale(0.7)">
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          )}
          {api.checkedState === "indeterminate" && (
            <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
              <line x1="21" x2="3" y1="12" y2="12" />
            </svg>
          )}
        </div>
      </label>
    </div>
  )
}
