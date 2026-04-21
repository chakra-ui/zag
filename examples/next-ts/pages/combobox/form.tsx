import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { XIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const controls = useControls(comboboxControls)

  const [options, setOptions] = useState(comboboxData)
  const [submitCount, setSubmitCount] = useState(0)
  const [lastSubmit, setLastSubmit] = useState<string | null>(null)

  const collection = combobox.collection<Item>({
    items: options,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    name: "country",
    onOpenChange() {
      setOptions(comboboxData)
    },
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      setOptions(filtered)
    },
    ...controls.context,
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <>
      <main className="combobox">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            const value = String(data.get("country") ?? "")
            setSubmitCount((c) => c + 1)
            setLastSubmit(value)
          }}
        >
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Select country</label>
            <div {...api.getControlProps()}>
              <input data-testid="input" {...api.getInputProps()} />
              <button data-testid="trigger" type="button" {...api.getTriggerProps()}>
                ▼
              </button>
              <button type="button" {...api.getClearTriggerProps()}>
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

          <div style={{ marginTop: 16 }}>
            <button type="submit">Submit</button>
          </div>
        </form>

        <section style={{ marginTop: 16 }}>
          <strong>submit count:</strong> <span data-testid="submit-count">{submitCount}</span>
          <br />
          <strong>last submitted value:</strong> <span data-testid="last-submit">{lastSubmit ?? "—"}</span>
        </section>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
