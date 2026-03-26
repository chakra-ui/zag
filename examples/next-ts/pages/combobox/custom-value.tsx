import styles from "../../../../shared/src/css/combobox.module.css"
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import { XIcon } from "lucide-react"
import { useId, useState } from "react"

interface Item {
  code: string
  label: string
}

export default function Page() {
  const [options, setOptions] = useState(comboboxData)

  const collection = combobox.collection({
    items: options,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const { contains } = createFilter({ sensitivity: "base" })

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    name: "country",
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      setOptions(filtered)
    },
    allowCustomValue: true,
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <main className="combobox">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          console.log(data.get("country"))
        }}
      >
        <div {...api.getRootProps()} className={styles.Root}>
          <label {...api.getLabelProps()} className={styles.Label}>Select country</label>
          <div {...api.getControlProps()} className={styles.Control}>
            <input data-testid="input" {...api.getInputProps()} className={styles.Input} />
            <button data-testid="trigger" {...api.getTriggerProps()}>
              ▼
            </button>
            <button {...api.getClearTriggerProps()} className={styles.ClearTrigger}>
              <XIcon />
            </button>
          </div>
        </div>
        <div {...api.getPositionerProps()}>
          {options.length > 0 && (
            <ul data-testid="combobox-content" {...api.getContentProps()} className={styles.Content}>
              {options.map((item) => (
                <li data-testid={item.code} key={item.code} {...api.getItemProps({ item })} className={styles.Item}>
                  <span {...api.getItemIndicatorProps({ item })}>✅</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </main>
  )
}
