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

export default function Page() {
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
  )

  const api = select.connect(state, send, normalizeProps)

  return (
    <main className="select">
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()}>
          <label {...api.getLabelProps()}>Label</label>
          <button {...api.getTriggerProps()}>{api.valueAsString || "Select a country"}</button>
        </div>

        <Portal>
          <div {...api.getPositionerProps()}>
            <div ref={contentRef} {...api.getContentProps()}>
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
    </main>
  )
}
