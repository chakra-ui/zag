/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { useId } from "react"

export const items = selectData

const collection = select.collection({
  items: selectData,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

interface SelectProps extends Omit<select.Context, "id" | "value" | "onValueChange" | "collection"> {
  value: string | null | undefined
  setValue: (value: string) => void
}

export function Select(props: SelectProps) {
  const { value, setValue, ...restProps } = props

  const [state, send] = useMachine(select.machine({ id: useId(), collection }), {
    context: {
      ...restProps,
      value: value ? [value] : undefined,
      onValueChange(details: any) {
        setValue(details.value[0])
      },
    },
  })

  const api = select.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <div {...api.controlProps}>
        <label {...api.labelProps}>Label</label>
        <button {...api.triggerProps}>{api.valueAsString || "Select a country"}</button>
      </div>

      <Portal>
        <div {...api.positionerProps}>
          <ul {...api.contentProps}>
            {items.map((item) => (
              <li key={item.value} {...api.getItemProps({ item })}>
                <span>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  )
}
