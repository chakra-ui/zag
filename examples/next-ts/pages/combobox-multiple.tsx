import * as combobox from "@zag-js/combobox"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import { XIcon } from "lucide-react"
import { matchSorter } from "match-sorter"
import { useId, useMemo, useRef, useState } from "react"
import { useControls } from "../hooks/use-controls"
import { Toolbar } from "../components/toolbar"
import { StateVisualizer } from "../components/state-visualizer"

interface Item {
  code: string
  label: string
}

export default function Page() {
  const controls = useControls({
    removeSelected: {
      type: "boolean",
      defaultValue: false,
    },
  })

  const [options, setOptions] = useState(comboboxData)
  const selectedValue = useRef<string[]>([])

  const removeSelected = controls.context.removeSelected

  const items = useMemo(() => {
    return removeSelected ? options.filter((item) => !selectedValue.current.includes(item.code)) : options
  }, [options, selectedValue.current, removeSelected])

  const collection = combobox.collection({
    items,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    onInputValueChange({ inputValue }) {
      const filtered = matchSorter(comboboxData, inputValue, { keys: ["label"] })
      setOptions(filtered.length > 0 ? filtered : comboboxData)
    },
    multiple: true,
    onValueChange({ value }) {
      selectedValue.current = value
    },
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <>
      <main className="combobox">
        <div>
          <b>{service.state.get()}</b>
          <b> / {api.highlightedValue || "-"}</b>
          <pre data-testid="value-text">{api.valueAsString}</pre>
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Select country</label>
            <div {...api.getControlProps()}>
              <input data-testid="input" {...api.getInputProps()} />
              <button
                data-testid="trigger"
                {...mergeProps(api.getTriggerProps(), {
                  onClick: () => setOptions(comboboxData),
                })}
              >
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
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
