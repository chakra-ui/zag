"use client"

import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { ListVirtualizer } from "@zag-js/virtualizer"
import { useCallback, useEffect, useId, useReducer, useState } from "react"
import { flushSync } from "react-dom"

const collection = select.collection({
  items: selectData,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

interface SelectProps extends Omit<
  select.Props,
  "id" | "value" | "defaultValue" | "onValueChange" | "collection" | "scrollToIndexFn"
> {
  defaultValue?: string | null | undefined
  value?: string | null | undefined
  onValueChange?: (value: string) => void
}

const toArray = (value: string | null | undefined) => (value ? [value] : undefined)

export function VirtualizedSelect(props: SelectProps) {
  const { value, defaultValue, onValueChange, defaultOpen, open, ...contextProps } = props

  const [, rerender] = useReducer(() => ({}), {})

  const [virtualizer] = useState(
    () =>
      new ListVirtualizer({
        count: selectData.length,
        estimatedSize: () => 32,
        observeScrollElementSize: true,
        onRangeChange() {
          flushSync(rerender)
        },
      }),
  )

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return
      virtualizer.init(el)
      rerender()
    },
    [virtualizer],
  )

  useEffect(() => () => virtualizer.destroy(), [virtualizer])

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    defaultValue: toArray(defaultValue),
    value: toArray(value),
    open,
    defaultOpen,
    ...contextProps,
    onValueChange(details: any) {
      onValueChange?.(details.value[0])
    },
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "center" })
    },
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
          <div {...api.getContentProps()} ref={setRef} onScroll={virtualizer.handleScroll}>
            <div
              style={{
                height: virtualizer.getTotalSize(),
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const item = selectData[virtualItem.index]
                return (
                  <div
                    key={item.value}
                    {...api.getItemProps({ item })}
                    style={{
                      ...virtualizer.getItemStyle(virtualItem),
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <span>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Portal>
    </div>
  )
}
