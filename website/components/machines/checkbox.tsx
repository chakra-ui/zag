import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

export function Checkbox(
  props: Omit<checkbox.Props, "id"> & { indeterminate: boolean },
) {
  const { indeterminate } = props
  const [checked, setChecked] = useState<boolean | "indeterminate">(
    indeterminate ? "indeterminate" : false,
  )

  const service = useMachine(checkbox.machine, {
    id: useId(),
    checked: indeterminate ? "indeterminate" : checked,
    onCheckedChange(details) {
      setChecked(details.checked)
    },
    ...props,
  })

  const api = checkbox.connect(service, normalizeProps)

  return (
    <div>
      <label {...api.getRootProps()}>
        <span {...api.getLabelProps()}>Checkbox Input</span>
        <input data-peer {...api.getHiddenInputProps()} />
        <div {...api.getControlProps()}>
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
