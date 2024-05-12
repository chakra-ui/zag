import * as combobox from "@zag-js/combobox"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { selectData } from "@zag-js/shared"
import { matchSorter } from "match-sorter"
import { useId, useMemo, useState } from "react"

export default function Page() {
  const [options, setOptions] = useState(selectData)

  const collection = useMemo(() => combobox.collection({ items: options }), [options])

  const [state, send] = useMachine(
    combobox.machine({
      id: useId(),
      collection,
      selectionBehavior: "clear",
      inputBehavior: "autohighlight",
      composite: false,
      onOpenChange() {
        setOptions(selectData)
      },
      onInputValueChange({ inputValue }) {
        const filtered = matchSorter(selectData, inputValue, { keys: ["label"] })
        setOptions(filtered.length > 0 ? filtered : selectData)
      },
    }),
    {
      context: {
        collection,
      },
    },
  )

  const api = combobox.connect(state, send, normalizeProps)

  return (
    <main className="select">
      <div {...api.rootProps}>
        <div {...api.controlProps} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <label {...api.labelProps}>Select an option</label>
          <button {...api.getTriggerProps({ focusable: true })}>
            <span>{api.valueAsString || "Choose..."} </span>
          </button>
        </div>

        <Portal>
          <div {...api.positionerProps}>
            <div {...api.contentProps}>
              <input style={{ position: "sticky", top: "0", width: "100%" }} {...api.inputProps} />
              <div {...api.listProps}>
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
