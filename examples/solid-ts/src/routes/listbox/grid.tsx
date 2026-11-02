import * as listbox from "@zag-js/listbox"
import { Check } from "lucide-solid"
import { listboxControls, listboxData, type ListboxOption } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/listbox.css"

const collection = listbox.gridCollection({
  items: listboxData.photos,
  columnCount: 3,
})

export default function Page() {
  const controls = useControls(listboxControls)

  const service = useMachine(
    listbox.machine as listbox.Machine<ListboxOption>,
    controls.mergeProps<listbox.Props<ListboxOption>>({
      collection,
      id: createUniqueId(),
      defaultValue: ["photo-43"],
    }),
  )

  const api = createMemo(() => listbox.connect(service, normalizeProps))

  return (
    <>
      <main class="listbox listbox-photos">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Cover photo</label>
          <div {...api().getContentProps()}>
            <ul {...api().getListProps()}>
              <For each={collection.items}>
                {(item) => (
                  <li {...api().getItemProps({ item, highlightOnHover: true })}>
                    <img src={item.src} alt="" loading="lazy" />
                    <span {...api().getItemTextProps({ item })}>{item.label}</span>
                    <span {...api().getItemIndicatorProps({ item })}>
                      <Check stroke-width={3} />
                    </span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </main>

      <Toolbar controls={controls} viz>
        <StateVisualizer state={service} context={["value", "highlightedValue"]} />
      </Toolbar>
    </>
  )
}
