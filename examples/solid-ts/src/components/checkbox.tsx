import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { CheckIcon, MinusIcon } from "lucide-solid"
import { createMemo, createUniqueId, Show, splitProps, type JSX } from "solid-js"

interface CheckboxProps extends Omit<checkbox.Props, "id"> {
  label: JSX.Element
  description?: JSX.Element
  "data-testid"?: string
}

export function Checkbox(props: CheckboxProps) {
  const [local, machineProps] = splitProps(props, ["label", "description", "data-testid"])
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
        {local.label}
        <Show when={local.description}>
          <span class="checkbox-description">{local.description}</span>
        </Show>
      </span>
      <input {...api().getHiddenInputProps()} data-testid={local["data-testid"]} />
    </label>
  )
}
