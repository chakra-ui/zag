import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/combobox.css"

interface FieldProps {
  label: string
  items: string[]
  format: (value: string) => string
}

function Field(props: FieldProps) {
  const [inputValue, setInputValue] = createSignal("")

  const collection = createMemo(() =>
    combobox.collection({ items: props.items.filter((item) => item.includes(inputValue())) }),
  )

  const id = createUniqueId()
  const service = useMachine(combobox.machine, () => ({
    id,
    collection: collection(),
    inputValue: inputValue(),
    onInputValueChange(details) {
      setInputValue(props.format(details.inputValue))
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <div>
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>{props.label}</label>
        <div {...api().getControlProps()}>
          <input {...api().getInputProps()} />
          <button {...api().getTriggerProps()}>▼</button>
        </div>
        <output>{inputValue()}</output>
      </div>
      <div {...api().getPositionerProps()}>
        <div {...api().getContentProps()}>
          <div {...api().getListProps()}>
            <For keyed={false} each={collection().items}>
              {(item) => <div {...api().getItemProps({ item: item() })}>{item()}</div>}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}

const digits = ["10001", "20002", "30003", "94105"]
const codes = ["ABC", "LAX", "NYC", "SFO"]

export default function Page() {
  return (
    <main class="combobox">
      <Field label="Digits" items={digits} format={(value) => value.replace(/\D/g, "")} />
      <Field label="Uppercase" items={codes} format={(value) => value.toUpperCase()} />
    </main>
  )
}
