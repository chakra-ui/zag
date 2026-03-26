import styles from "../../../../shared/src/css/select.module.css"
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

  const virtualizer = useVirtualizer({
    count: selectData.length,
    getScrollElement: () => contentRef.current,
    estimateSize: () => 32,
  })

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "center", behavior: "auto" })
    },
  })

  const api = select.connect(service, normalizeProps)

  return (
    <main className="select">
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()} className={styles.Control}>
          <label {...api.getLabelProps()} className={styles.Label}>Label</label>
          <button {...api.getTriggerProps()} className={styles.Trigger}>{api.valueAsString || "Select a country"}</button>
        </div>

        <Portal>
          <div {...api.getPositionerProps()} className={styles.Positioner}>
            <div ref={contentRef} {...api.getContentProps()} className={styles.Content}>
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const item = selectData[virtualItem.index]
                  return (
                    <div
                      key={item.value}
                      {...api.getItemProps({ item })} className={styles.Item}
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
