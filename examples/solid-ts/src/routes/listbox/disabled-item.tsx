import * as listbox from "@zag-js/listbox"
import { listboxControls, listboxData, type ListboxOption } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/listbox.css"

// "Same day" is disabled through its `disabled` field
const collection = listbox.collection({ items: listboxData.shippingMethods })

export default function Page() {
  const controls = useControls(listboxControls)

  const service = useMachine(
    listbox.machine as listbox.Machine<ListboxOption>,
    controls.mergeProps<listbox.Props<ListboxOption>>({
      collection,
      id: createUniqueId(),
      defaultValue: ["standard"],
    }),
  )

  const api = createMemo(() => listbox.connect(service, normalizeProps))

  return (
    <>
      <main class="listbox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Shipping method</label>
          <div {...api().getContentProps()}>
            <ul {...api().getListProps()}>
              <For each={listboxData.shippingMethods}>
                {(item) => (
                  <li {...api().getItemProps({ item, highlightOnHover: true })}>
                    <div class="listbox-item-body">
                      <span {...api().getItemTextProps({ item })}>{item.label}</span>
                      <span class="listbox-item-description">{item.description}</span>
                    </div>
                    <span {...api().getItemIndicatorProps({ item })}>✓</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} context={["value", "highlightedValue"]} />
      </Toolbar>
    </>
  )
}
