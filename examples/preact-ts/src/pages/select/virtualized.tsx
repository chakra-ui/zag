import { mergeProps, Portal, normalizeProps, useMachine } from "@zag-js/preact"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { ChevronsUpDownIcon } from "lucide-preact"
import { useId } from "preact/hooks"
import { useListVirtualizer } from "../../hooks/use-virtualizer"
import "@styles/select.css"

const collection = select.collection({
  items: selectData,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

export default function Page() {
  const { virtualizer, ref } = useListVirtualizer({
    count: selectData.length,
    itemSize: 32,
    observeScrollElementSize: true,
  })

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: details.immediate ? "center" : "auto" })
    },
  })

  const api = select.connect(service, normalizeProps)

  return (
    <main className="select">
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()}>
          <label {...api.getLabelProps()}>Label</label>
          <button {...api.getTriggerProps()}>
            <span>{api.valueAsString || "Select a country"}</span>
            <span {...api.getIndicatorProps()}>
              <ChevronsUpDownIcon />
            </span>
          </button>
        </div>

        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...mergeProps(virtualizer.getRootProps(), api.getListProps())} ref={ref}>
                <div {...virtualizer.getContentProps()}>
                  {virtualizer.getVirtualItems().map((vi) => {
                    const item = selectData[vi.index]
                    return (
                      <div key={item.value} {...mergeProps(virtualizer.getItemProps(vi), api.getItemProps({ item }))}>
                        <span {...api.getItemTextProps({ item })}>{item.label}</span>
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
