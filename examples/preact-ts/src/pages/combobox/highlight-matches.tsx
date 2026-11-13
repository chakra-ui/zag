import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { comboboxData } from "@zag-js/shared"
import { XIcon } from "lucide-preact"
import { useId, useState } from "preact/hooks"
import { Highlight } from "../../components/highlight"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const matches = (text: string, query: string) => text.toLowerCase().includes(query.toLowerCase())

export default function Page() {
  const [query, setQuery] = useState("")
  const options = comboboxData.filter((item) => matches(item.label, query))

  const collection = combobox.collection({
    items: options,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    onInputValueChange({ inputValue, reason }) {
      // A selected label or cleared input isn't a query
      setQuery(reason === "input-change" ? inputValue : "")
    },
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <>
      <main className="combobox">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Select country</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} />
            <button {...api.getTriggerProps()}>▼</button>
            <button {...api.getClearTriggerProps()}>
              <XIcon />
            </button>
          </div>
        </div>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getEmptyProps()}>{options.length === 0 && "No results found"}</div>
            {options.length > 0 && (
              <div {...api.getListProps()}>
                {options.map((item) => (
                  <div key={item.code} {...api.getItemProps({ item })}>
                    <span {...api.getItemTextProps({ item })}>
                      <Highlight text={item.label} query={query} />
                    </span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
