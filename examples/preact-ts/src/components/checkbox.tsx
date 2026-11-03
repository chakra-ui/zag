import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { CheckIcon, MinusIcon } from "lucide-preact"
import type { ComponentChildren } from "preact"
import { useId } from "preact/hooks"

interface CheckboxProps extends Omit<checkbox.Props, "id"> {
  label: ComponentChildren
  description?: ComponentChildren
  "data-testid"?: string
}

export function Checkbox(props: CheckboxProps) {
  const { label, description, "data-testid": testId, ...machineProps } = props
  const service = useMachine(checkbox.machine, { id: useId(), ...machineProps })
  const api = checkbox.connect(service, normalizeProps)

  return (
    <label {...api.getRootProps()}>
      <div {...api.getControlProps()}>
        <span {...api.getIndicatorProps()}>{api.indeterminate ? <MinusIcon /> : <CheckIcon />}</span>
      </div>
      <span {...api.getLabelProps()}>
        {label}
        {description && <span className="checkbox-description">{description}</span>}
      </span>
      <input {...api.getHiddenInputProps()} data-testid={testId} />
    </label>
  )
}
