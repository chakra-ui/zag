import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { useId } from "react"
import { useListVirtualizer } from "../../hooks/use-virtualizer"

const collection = select.collection({
  items: selectData,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

export default function Page() {
  const { virtualizer, ref } = useListVirtualizer({
    count: selectData.length,
    estimatedSize: () => 32,
    observeScrollElementSize: true,
  })

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "center" })
    },
  })

  const api = select.connect(service, normalizeProps)

  return (
    <main className="select">
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()}>
          <label {...api.getLabelProps()}>Label</label>
          <button {...api.getTriggerProps()}>{api.valueAsString || "Select a country"}</button>
        </div>

        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...api.getListProps()} ref={ref} onScroll={virtualizer.handleScroll}>
                <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
                  {virtualizer.getVirtualItems().map((vi) => {
                    const item = selectData[vi.index]
                    return (
                      <div
                        key={item.value}
                        {...api.getItemProps({ item })}
                        style={{
                          ...virtualizer.getItemStyle(vi),
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
          </div>
        </Portal>
      </div>
    </main>
  )
}
