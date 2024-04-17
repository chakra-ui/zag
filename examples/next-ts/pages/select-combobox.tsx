import * as combobox from "@zag-js/combobox"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { selectData } from "@zag-js/shared"
import { matchSorter } from "match-sorter"
import { useId, useRef, useState } from "react"

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [options, setOptions] = useState(selectData)

  const liveCollection = combobox.collection({
    items: options,
  })

  const [state, send] = useMachine(
    combobox.machine({
      id: useId(),
      collection: liveCollection,
      selectionBehavior: "clear",
      inputBehavior: "autohighlight",
      triggerOnly: true,
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
        collection: liveCollection,
      },
    },
  )

  const api = combobox.connect(state, send, normalizeProps)

  return (
    <main className="select">
      <div {...api.rootProps}>
        <div {...api.controlProps} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <label {...api.labelProps}>Select an option</label>
          <button ref={buttonRef} {...api.triggerProps}>
            <span>{api.valueAsString || "Choose..."} </span>
          </button>
        </div>

        <Portal>
          <div {...api.positionerProps}>
            <div {...api.contentProps}>
              <input ref={inputRef} style={{ position: "sticky", top: "0", width: "100%" }} {...api.inputProps} />
              <div {...api.listboxProps}>
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
