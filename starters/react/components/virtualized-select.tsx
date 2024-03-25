/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { useId, useRef } from "react"

const collection = select.collection({
  items: selectData,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

interface SelectProps
  extends Omit<select.Context, "id" | "value" | "onValueChange" | "collection" | "scrollToIndexFn"> {
  defaultValue?: string | null | undefined
  defaultOpen?: boolean
  value?: string | null | undefined
  onValueChange?: (value: string) => void
}

const toArray = (value: string | null | undefined) => (value ? [value] : undefined)

export function VirtualizedSelect(props: SelectProps) {
  const { value, defaultValue, onValueChange, defaultOpen, open, ...contextProps } = props

  const contentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: selectData.length,
    getScrollElement: () => contentRef.current,
    estimateSize: () => 32,
  })

  const timerRef = useRef<NodeJS.Timeout>()

  const [state, send] = useMachine(
    select.machine({
      id: useId(),
      collection,
      value: toArray(value) ?? toArray(defaultValue),
      open: open ?? defaultOpen,
      scrollToIndexFn(details) {
        if (!details.immediate) {
          rowVirtualizer.scrollToIndex(details.index, { align: "center", behavior: "auto" })
        } else {
          clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => {
            rowVirtualizer.scrollToIndex(details.index, { align: "center", behavior: "auto" })
          })
        }
      },
    }),
    {
      context: {
        ...contextProps,
        open,
        "open.controlled": open !== undefined,
        value: toArray(value),
        onValueChange(details: any) {
          onValueChange?.(details.value[0])
        },
      },
    },
  )

  const api = select.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <div {...api.controlProps}>
        <label {...api.labelProps}>Label</label>
        <button {...api.triggerProps}>{api.valueAsString || "Select a country"}</button>
      </div>

      <Portal>
        <div {...api.positionerProps}>
          <div ref={contentRef} {...api.contentProps}>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const item = selectData[virtualItem.index]
                return (
                  <div
                    key={item.value}
                    {...api.getItemProps({ item })}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
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
