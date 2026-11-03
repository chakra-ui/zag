import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { comboboxControls, groupedData } from "@zag-js/shared"
import { XIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

type Item = (typeof groupedData)[number]

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const controls = useControls(comboboxControls)

  const [options, setOptions] = useState(groupedData)

  const collection = combobox.collection({ items: options, groupBy: (item) => item.type })

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    onOpenChange({ open }) {
      if (!open) setOptions(groupedData)
    },
    onInputValueChange({ inputValue }) {
      const filtered = groupedData.filter((item) => contains(item.label, inputValue))
      setOptions(filtered.length > 0 ? filtered : groupedData)
    },
    ...controls.context,
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <>
      <main className="combobox">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Select produce</label>
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
            <div {...api.getContentProps()}>
              {collection.group().map(([type, items]) => (
                <div key={type} {...api.getItemGroupProps({ id: type })}>
                  <div {...api.getItemGroupLabelProps({ htmlFor: type })}>{type}</div>
                  {items.map((item) => (
                    <div key={item.value} {...api.getItemProps({ item })}>
                      <span {...api.getItemTextProps({ item })}>{item.label}</span>
                      <span {...api.getItemIndicatorProps({ item })}>✓</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
