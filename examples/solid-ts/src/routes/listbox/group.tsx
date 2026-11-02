import * as listbox from "@zag-js/listbox"
import { listboxControls, listboxData, type ListboxOption } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/listbox.css"

const collection = listbox.collection({
  items: listboxData.timezones,
  groupBy: (item) => item.group ?? "",
})

export default function Page() {
  const controls = useControls(listboxControls)

  const service = useMachine(
    listbox.machine as listbox.Machine<ListboxOption>,
    controls.mergeProps<listbox.Props<ListboxOption>>({
      collection,
      id: createUniqueId(),
      defaultValue: ["Europe/London"],
    }),
  )

  const api = createMemo(() => listbox.connect(service, normalizeProps))

  return (
    <>
      <main class="listbox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Timezone</label>
          <div {...api().getContentProps()}>
            <div {...api().getListProps()}>
              <For each={collection.group()}>
                {([group, items]) => (
                  <div {...api().getItemGroupProps({ id: group })}>
                    <div {...api().getItemGroupLabelProps({ htmlFor: group })}>{group}</div>
                    <For each={items}>
                      {(item) => (
                        <div {...api().getItemProps({ item, highlightOnHover: true })}>
                          <span {...api().getItemTextProps({ item })}>{item.label}</span>
                          <span class="listbox-item-description">{item.description}</span>
                          <span {...api().getItemIndicatorProps({ item })}>✓</span>
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

      <Toolbar controls={controls}>
        <StateVisualizer state={service} context={["value", "highlightedValue"]} />
      </Toolbar>
    </>
  )
}
