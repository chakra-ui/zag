import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { selectData } from "@zag-js/shared"
import { useId, useMemo, useState } from "react"

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [options, setOptions] = useState(selectData)

  const collection = useMemo(() => combobox.collection({ items: options }), [options])

  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    selectionBehavior: "clear",
    inputBehavior: "autohighlight",
    composite: false,
    onOpenChange() {
      setOptions(selectData)
    },
    onInputValueChange({ inputValue }) {
      const filtered = selectData.filter((item) => contains(item.label, inputValue))
      setOptions(filtered.length > 0 ? filtered : selectData)
    },
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <main className="select">
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <label {...api.getLabelProps()}>Country</label>
          <button {...api.getTriggerProps({ focusable: true })}>
            <span>{api.valueAsString || "Select Country"} </span>
            <span>▼</span>
          </button>
        </div>

        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <input style={{ position: "sticky", top: "0", width: "100%" }} {...api.getInputProps()} />
              <div {...api.getListProps()}>
                {options.map((item) => (
                  <div key={item.value} {...api.getItemProps({ item })}>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}
