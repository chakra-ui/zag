import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { listboxControls, listboxData, type ListboxOption } from "@zag-js/shared"
import { useId } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"
import "@styles/listbox.css"

const collection = listbox.collection({
  items: listboxData.timezones,
  groupBy: (item) => item.group ?? "",
})

export default function Page() {
  const controls = useControls(listboxControls)

  const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
    collection,
    id: useId(),
    defaultValue: ["Europe/London"],
    ...controls.context,
  })

  const api = listbox.connect(service, normalizeProps)

  return (
    <>
      <main className="listbox">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Timezone</label>
          <div {...api.getContentProps()}>
            <div {...api.getListProps()}>
              {collection.group().map(([group, items]) => (
                <div key={group} {...api.getItemGroupProps({ id: group })}>
                  <div {...api.getItemGroupLabelProps({ htmlFor: group })}>{group}</div>
                  {items.map((item) => (
                    <div key={item.value} {...api.getItemProps({ item, highlightOnHover: true })}>
                      <span {...api.getItemTextProps({ item })}>{item.label}</span>
                      <span className="listbox-item-description">{item.description}</span>
                      <span {...api.getItemIndicatorProps({ item })}>✓</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} context={["value", "highlightedValue"]} />
      </Toolbar>
    </>
  )
}
