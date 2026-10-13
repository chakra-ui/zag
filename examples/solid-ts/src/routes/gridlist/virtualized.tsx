import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { CheckIcon } from "lucide-solid"
import { createMemo, createUniqueId, Index, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useListVirtualizer } from "~/hooks/use-virtualizer"
import "@styles/gridlist.css"

interface Row {
  id: string
  index: number
  name: string
}

const ROW_HEIGHT = 44
const ROW_COUNT = 10000

const items: Row[] = Array.from({ length: ROW_COUNT }, (_, i) => ({
  id: `row-${i}`,
  index: i,
  name: `Row ${i + 1}`,
}))

const collection = gridlist.collection<Row>({
  items,
  itemToValue: (item) => item.id,
  itemToString: (item) => item.name,
})

export default function Page() {
  const { virtualizer, ref } = useListVirtualizer({
    count: items.length,
    estimatedSize: () => ROW_HEIGHT,
    overscan: 8,
  })

  const service = useMachine(gridlist.machine as gridlist.Machine<Row>, {
    id: createUniqueId(),
    collection,
    selectionMode: "multiple",
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
  })

  const api = createMemo(() => gridlist.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="gridlist">
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>10,000 rows</label>
            <div
              ref={ref}
              {...api().getContentProps()}
              tabIndex={0}
              onScroll={virtualizer.handleScroll}
              style={{ height: "360px", width: "480px" }}
            >
              <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
                <Index each={virtualizer.getVirtualItems()}>
                  {(vi) => {
                    const item = () => items[vi().index]
                    return (
                      <div
                        {...api().getItemProps({ item: item() })}
                        data-index={vi().index}
                        style={{ ...virtualizer.getItemStyle(vi()), "overflow-anchor": "none" }}
                      >
                        <div {...api().getCellProps()}>
                          <Show when={api().hasCheckbox}>
                            <button {...api().getItemCheckboxProps({ item: item() })}>
                              <CheckIcon {...api().getItemIndicatorProps({ item: item() })} />
                            </button>
                          </Show>
                          <div class="gridlist-item-body">
                            <span {...api().getItemTextProps({ item: item() })} class="gridlist-item-title">
                              {item().name}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }}
                </Index>
              </div>
            </div>
          </div>

          <p style={{ "margin-top": "12px", "font-size": "13px", color: "#52525b" }}>
            Selected: <strong>{api().value.length}</strong> · Rendered: {virtualizer.getVirtualItems().length} of{" "}
            {items.length}
          </p>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["focusedValue", "value"]} />
      </Toolbar>
    </>
  )
}
