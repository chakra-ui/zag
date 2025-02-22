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

interface SelectProps extends Omit<select.Props, "id" | "value" | "defaultValue" | "onValueChange" | "collection"> {
  defaultValue?: string | null | undefined
  value?: string | null | undefined
  onValueChange?: (value: string) => void
}

const toArray = (value: string | null | undefined) => (value ? [value] : undefined)

export function Select(props: SelectProps) {
  const { value, defaultValue, onValueChange, defaultOpen, open, ...contextProps } = props

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    defaultValue: toArray(defaultValue),
    value: toArray(value),
    open,
    defaultOpen,
    onValueChange(details: any) {
      onValueChange?.(details.value[0])
    },
    ...contextProps,
  })

  const api = select.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getControlProps()}>
        <label {...api.getLabelProps()}>Label</label>
        <button {...api.getTriggerProps()}>{api.valueAsString || "Select a country"}</button>
      </div>

      <Portal>
        <div {...api.getPositionerProps()}>
          <ul {...api.getContentProps()}>
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
