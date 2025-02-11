import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { XIcon } from "lucide-react"
import { matchSorter } from "match-sorter"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(comboboxControls)

  const [options, setOptions] = useState(comboboxData)

  const collection = combobox.collection({
    items: options,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    onOpenChange() {
      setOptions(comboboxData)
    },
    onInputValueChange({ inputValue }) {
      const filtered = matchSorter(comboboxData, inputValue, { keys: ["label"] })
      setOptions(filtered.length > 0 ? filtered : comboboxData)
    },
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <>
      <main className="combobox">
        <div>
          <button onClick={() => api.setValue(["TG"])}>Set to Togo</button>
          <button data-testid="clear-value-button" onClick={() => api.clearValue()}>
            Clear Value
          </button>
          <br />
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Select country</label>
            <div {...api.getControlProps()}>
              <input data-testid="input" {...api.getInputProps()} />
              <button data-testid="trigger" {...api.getTriggerProps()}>
                ▼
              </button>
              <button {...api.getClearTriggerProps()}>
                <XIcon />
              </button>
            </div>
          </div>
          <div {...api.getPositionerProps()}>
            {options.length > 0 && (
              <ul data-testid="combobox-content" {...api.getContentProps()}>
                {options.map((item) => (
                  <li data-testid={item.code} key={item.code} {...api.getItemProps({ item })}>
                    <span {...api.getItemIndicatorProps({ item })}>✅</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
