import * as listbox from "@zag-js/listbox"
import { groupedData, listboxControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/listbox.css"

type Item = (typeof groupedData)[number]

const collection = listbox.gridCollection({
  items: groupedData,
  columnCount: 2,
  groupBy: (item) => item.type,
})

export default function Page() {
  const controls = useControls(listboxControls)

  const service = useMachine(
    listbox.machine as listbox.Machine<Item>,
    controls.mergeProps<listbox.Props<Item>>({
      collection,
      id: createUniqueId(),
    }),
  )

  const api = createMemo(() => listbox.connect(service, normalizeProps))

  return (
    <>
      <main class="listbox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Label</label>
          <div {...api().getContentProps()}>
            <div {...api().getListProps()}>
              <For each={collection.group()}>
                {([type, items]) => (
                  <div {...api().getItemGroupProps({ id: type })} style={{ display: "contents" }}>
                    <div {...api().getItemGroupLabelProps({ htmlFor: type })} style={{ "grid-column": "1 / -1" }}>
                      {type}
                    </div>
                    <For each={items}>
                      {(item) => (
                        <div {...api().getItemProps({ item })}>
                          <span {...api().getItemTextProps({ item })}>{item.label}</span>
                        </div>
                      )}
                    </For>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls} viz>
        <StateVisualizer state={service} context={["highlightedValue"]} />
      </Toolbar>
    </>
  )
}
