import * as listbox from "@zag-js/listbox"
import { Check } from "lucide-preact"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { listboxControls, listboxData, type ListboxOption } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"
import "@styles/listbox.css"

const collection = listbox.gridCollection({
  items: listboxData.photos,
  columnCount: 3,
})

export default function Page() {
  const controls = useControls(listboxControls)

  const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
    collection,
    id: useId(),
    defaultValue: ["photo-43"],
    ...controls.context,
  })

  const api = listbox.connect(service, normalizeProps)

  return (
    <>
      <main className="listbox listbox-photos">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Cover photo</label>
          <div {...api.getContentProps()}>
            <ul {...api.getListProps()}>
              {collection.items.map((item) => (
                <li key={item.value} {...api.getItemProps({ item, highlightOnHover: true })}>
                  <img src={item.src} alt="" loading="lazy" />
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  <span {...api.getItemIndicatorProps({ item })}>
                    <Check strokeWidth={3} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={service} context={["value", "highlightedValue"]} />
      </Toolbar>
    </>
  )
}
