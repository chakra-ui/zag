import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { useId } from "react"

interface Item {
  label: string
  value: string
  disabled?: boolean
}

export default function Page() {
  const service = useMachine(select.machine as select.Machine<Item>, {
    id: useId(),
    collection: select.collection({
      items: [
        { label: "Apple", value: "apple" },
        { label: "Banana", value: "banana" },
        { label: "Cherry", value: "cherry" },
        { label: "Coconut", value: "coconut" },
        { label: "Date", value: "date" },
        { label: "Duck", value: "duck", disabled: true },
        { label: "Elephant", value: "elephant" },
        { label: "Fish", value: "fish" },
        { label: "Giraffe", value: "giraffe" },
        { label: "Hippo", value: "hippo" },
        { label: "Igloo", value: "igloo" },
      ],
    }),
  })

  const api = select.connect(service, normalizeProps)

  return (
    <main className="select">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Label</label>
        <div {...api.getControlProps()}>
          <button {...api.getTriggerProps()}>
            <span>{api.valueAsString || "Select option"}</span>
            <span {...api.getIndicatorProps()}>▼</span>
          </button>
          <button {...api.getClearTriggerProps()}>X</button>
        </div>
        <Portal>
          <div {...api.getPositionerProps()}>
            <ul {...api.getContentProps()}>
              {api.collection.items.map((item) => (
                <li key={item.value} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </li>
              ))}
            </ul>
          </div>
        </Portal>
      </div>
    </main>
  )
}
