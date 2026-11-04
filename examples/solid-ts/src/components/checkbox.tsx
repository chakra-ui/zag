import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { CheckIcon, MinusIcon } from "lucide-solid"
import { createMemo, createUniqueId, Show, omit } from "solid-js"
import type { JSX } from "@solidjs/web"

interface CheckboxProps extends Omit<checkbox.Props, "id"> {
  label: JSX.Element
  description?: JSX.Element
  "data-testid"?: string
}

export function Checkbox(props: CheckboxProps) {
  const machineProps = omit(props, "label", "description", "data-testid")
  const id = createUniqueId()
  const service = useMachine(checkbox.machine, () => ({ id, ...machineProps }))
  const api = createMemo(() => checkbox.connect(service, normalizeProps))

  return (
    <label {...api().getRootProps()}>
      <div {...api().getControlProps()}>
        <span {...api().getIndicatorProps()}>
          <Show when={api().indeterminate} fallback={<CheckIcon />}>
            <MinusIcon />
          </Show>
        </span>
      </div>
      <span {...api().getLabelProps()}>
        {props.label}
        <Show when={props.description}>
          <span class="checkbox-description">{props.description}</span>
        </Show>
      </span>
      <input {...api().getHiddenInputProps()} data-testid={props["data-testid"]} />
    </label>
  )
}
