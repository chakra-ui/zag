import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { listboxControls, listboxData, type ListboxOption } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"
import "@styles/listbox.css"

// "Same day" is disabled through its `disabled` field
const collection = listbox.collection({ items: listboxData.shippingMethods })

export default function Page() {
  const controls = useControls(listboxControls)

  const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
    collection,
    id: useId(),
    defaultValue: ["standard"],
    ...controls.context,
  })

  const api = listbox.connect(service, normalizeProps)

  return (
    <>
      <main className="listbox">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Shipping method</label>
          <div {...api.getContentProps()}>
            <ul {...api.getListProps()}>
              {listboxData.shippingMethods.map((item) => (
                <li key={item.value} {...api.getItemProps({ item, highlightOnHover: true })}>
                  <div className="listbox-item-body">
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                    <span className="listbox-item-description">{item.description}</span>
                  </div>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} context={["value", "highlightedValue"]} />
      </Toolbar>
    </>
  )
}
