import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { useState } from "react"

const Select = (props: { id: string }) => {
  const [open, setOpen] = useState(false)

  const service = useMachine(select.machine, {
    collection: select.collection({ items: selectData }),
    id: props.id,
    name: "country",
    open,
    onOpenChange: (details) => setOpen(details.open),
  })

  const api = select.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getControlProps()}>
        <button {...api.getTriggerProps()}>
          <span>{api.valueAsString || "Select option"}</span>
          <span {...api.getIndicatorProps()}>▼</span>
        </button>
      </div>
      <Portal>
        <div {...api.getPositionerProps()}>
          <ul {...api.getContentProps()}>
            {selectData.map((item) => (
              <li key={item.value} {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  )
}

export default function Page() {
  return (
    <main className="select">
      <div style={{ display: "flex", gap: "4px" }}>
        <Select id="a" />
        <Select id="b" />
      </div>
    </main>
  )
}
