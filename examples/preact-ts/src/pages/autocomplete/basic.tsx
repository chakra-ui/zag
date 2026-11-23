import * as autocomplete from "@zag-js/autocomplete"
import { createFilter } from "@zag-js/utils/search"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { autocompleteControls, comboboxData } from "@zag-js/shared"
import { XIcon } from "lucide-preact"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"
import "@styles/autocomplete.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const controls = useControls(autocompleteControls)
  const [value, setValue] = useState("")
  const [submitted, setSubmitted] = useState<string | null>(null)

  // `list` and `both` show suggestions that match the text
  const filtered = controls.context.mode === "list" || controls.context.mode === "both"
  const items = filtered ? comboboxData.filter((item) => contains(item.label, value)) : comboboxData

  const collection = autocomplete.collection<Item>({
    items,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(autocomplete.machine as autocomplete.Machine<Item>, {
    id: useId(),
    collection,
    name: "country",
    placeholder: "Search countries",
    value,
    onValueChange: (details) => setValue(details.value),
    ...controls.context,
  })

  const api = autocomplete.connect(service, normalizeProps)

  return (
    <>
      <main className="autocomplete">
        <form
          className="autocomplete-form"
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitted(String(new FormData(event.currentTarget).get("country")))
          }}
        >
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Country</label>
            <div {...api.getControlProps()}>
              <input {...api.getInputProps()} />
              <button {...api.getClearTriggerProps()}>
                <XIcon />
              </button>
              <button {...api.getTriggerProps()}>▼</button>
            </div>
          </div>
          <button type="submit">Submit</button>
        </form>

        <pre data-testid="output">
          value: {JSON.stringify(api.value)}
          {"\n"}submitted: {submitted == null ? "—" : JSON.stringify(submitted)}
        </pre>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getEmptyProps()}>No countries match</div>
            <ul {...api.getListProps()}>
              {items.map((item) => (
                <li key={item.code} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
