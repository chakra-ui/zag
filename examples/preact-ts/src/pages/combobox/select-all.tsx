import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { comboboxData } from "@zag-js/shared"
import { XIcon } from "lucide-preact"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [query, setQuery] = useState("")
  const items = comboboxData.filter((item) => contains(item.label, query))

  const collection = combobox.collection({
    items,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    multiple: true,
    onOpenChange({ open }) {
      if (open) setQuery("")
    },
    onInputValueChange({ inputValue, reason }) {
      if (reason === "input-change") setQuery(inputValue)
    },
  })

  const api = combobox.connect(service, normalizeProps)
  const selectAll = api.getSelectAllState()

  return (
    <>
      <main className="combobox">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Countries</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} placeholder={`${api.value.length} selected`} />
            <button {...api.getTriggerProps()}>▼</button>
            <button {...api.getClearTriggerProps()}>
              <XIcon />
            </button>
          </div>
        </div>
        <pre data-testid="value">value: {api.value.join(", ") || "—"}</pre>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getListProps()}>
              {/* Selects every item that matches the text, or unselects them all */}
              <div {...api.getSelectAllProps()}>
                <span className="combobox-check">{selectAll.checked ? "✓" : selectAll.indeterminate ? "–" : ""}</span>
                <span>{selectAll.checked ? "Unselect all" : "Select all"}</span>
              </div>
              <hr {...api.getSeparatorProps()} />
              {items.map((item) => (
                <div key={item.code} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
