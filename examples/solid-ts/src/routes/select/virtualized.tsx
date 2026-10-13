import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon } from "lucide-solid"
import { createMemo, createUniqueId, Index } from "solid-js"
import { Portal } from "solid-js/web"
import { useListVirtualizer } from "~/hooks/use-virtualizer"
import "@styles/select.css"

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
    id: createUniqueId(),
    collection,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "center" })
    },
  })

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <main class="select">
      <div {...api().getRootProps()}>
        <div {...api().getControlProps()}>
          <label {...api().getLabelProps()}>Label</label>
          <button {...api().getTriggerProps()}>
            <span>{api().valueAsString || "Select a country"}</span>
            <span {...api().getIndicatorProps()}>
              <ChevronsUpDownIcon />
            </span>
          </button>
        </div>

        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <div {...api().getListProps()} ref={ref} onScroll={virtualizer.handleScroll}>
                <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
                  <Index each={virtualizer.getVirtualItems()}>
                    {(vi) => {
                      const item = () => selectData[vi().index]
                      return (
                        <div {...api().getItemProps({ item: item() })} style={virtualizer.getItemStyle(vi())}>
                          <span {...api().getItemTextProps({ item: item() })}>{item().label}</span>
                          <span {...api().getItemIndicatorProps({ item: item() })}>✓</span>
                        </div>
                      )
                    }}
                  </Index>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}
